import { CodebaseFile } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Scans GitHub repositories and extracts codebase information
 */
export class GitHubScanner {
  private tempDir = path.join(process.cwd(), '.tmp-repos');

  /**
   * Clones a GitHub repository and scans its contents
   */
  async scanRepository(githubUrl: string): Promise<{
    files: CodebaseFile[];
    repositoryName: string;
  }> {
    const repoName = this.extractRepoName(githubUrl);
    const repoPath = path.join(this.tempDir, repoName);

    try {
      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true });

      // Clone the repository (shallow clone for efficiency)
      console.log(`Cloning repository: ${githubUrl}`);
      await execAsync(`git clone --depth 1 ${githubUrl} ${repoPath}`);

      // Scan the repository files
      const files = await this.scanDirectory(repoPath);

      return {
        files,
        repositoryName: repoName
      };
    } catch (error) {
      throw new Error(`Failed to scan repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Recursively scans a directory and extracts file information
   */
  private async scanDirectory(dirPath: string, baseDir?: string): Promise<CodebaseFile[]> {
    if (!baseDir) baseDir = dirPath;

    const files: CodebaseFile[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip git directories and node_modules
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await this.scanDirectory(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Only scan source code files
        if (this.isSourceFile(entry.name)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const stats = await fs.stat(fullPath);
            const relativePath = path.relative(baseDir, fullPath);

            files.push({
              path: relativePath,
              content,
              size: stats.size
            });
          } catch (error) {
            // Skip files that can't be read
            console.warn(`Could not read file ${fullPath}:`, error);
          }
        }
      }
    }

    return files;
  }

  /**
   * Checks if a file is a source code file we should scan
   */
  private isSourceFile(filename: string): boolean {
    const extensions = [
      '.js', '.jsx', '.ts', '.tsx',
      '.py', '.java', '.go', '.rs',
      '.c', '.cpp', '.cs', '.rb',
      '.php', '.swift', '.kt',
      '.vue', '.svelte', '.html',
      '.css', '.scss', '.graphql'
    ];

    return extensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Extracts repository name from GitHub URL
   */
  private extractRepoName(githubUrl: string): string {
    const match = githubUrl.match(/github\.com\/[^\/]+\/([^\/\.]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }
    return match[1];
  }

  /**
   * Cleans up temporary repository files
   */
  async cleanup(repositoryName: string): Promise<void> {
    const repoPath = path.join(this.tempDir, repositoryName);
    try {
      await execAsync(`rm -rf ${repoPath}`);
    } catch (error) {
      console.warn(`Could not clean up repository ${repositoryName}:`, error);
    }
  }
}
