import { Octokit } from "@octokit/rest";
import type { User } from "@shared/schema";

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  url: string;
}

export interface CodeAnalysisResult {
  files: string[];
  languages: { [key: string]: number };
  complexity: number;
  suggestions: string[];
  securityIssues: string[];
  documentation: string;
}

export class GitHubIntegrationService {
  private octokit: Octokit;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  // Connect user's GitHub account
  async connectGitHub(user: User, accessToken: string): Promise<{ success: boolean; profile: any }> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data: profile } = await octokit.rest.users.getAuthenticated();
      
      return {
        success: true,
        profile: {
          username: profile.login,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar_url,
          repositories: profile.public_repos,
          followers: profile.followers,
          following: profile.following
        }
      };
    } catch (error) {
      console.error('GitHub connection error:', error);
      return { success: false, profile: null };
    }
  }

  // Get user's repositories
  async getUserRepositories(accessToken: string, page = 1, per_page = 30): Promise<GitHubRepository[]> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        direction: 'desc',
        page,
        per_page
      });

      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        isPrivate: repo.private,
        url: repo.html_url
      }));
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  // Analyze repository code
  async analyzeRepository(accessToken: string, owner: string, repo: string): Promise<CodeAnalysisResult> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      
      // Get repository content
      const { data: contents } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: ''
      });

      const files: string[] = [];
      const languages: { [key: string]: number } = {};

      if (Array.isArray(contents)) {
        for (const item of contents) {
          if (item.type === 'file') {
            files.push(item.name);
            const extension = this.getFileExtension(item.name);
            const language = this.getLanguageFromExtension(extension);
            languages[language] = (languages[language] || 0) + 1;
          }
        }
      }

      // Get repository languages from GitHub API
      const { data: repoLanguages } = await octokit.rest.repos.listLanguages({
        owner,
        repo
      });

      // Merge language data
      Object.entries(repoLanguages).forEach(([lang, bytes]) => {
        languages[lang] = (languages[lang] || 0) + (bytes as number);
      });

      // Analyze code complexity and generate suggestions
      const complexity = this.calculateRepositoryComplexity(files, languages);
      const suggestions = this.generateCodeSuggestions(files, languages);
      const securityIssues = this.identifySecurityIssues(files);
      const documentation = this.generateDocumentation(files, languages);

      return {
        files,
        languages,
        complexity,
        suggestions,
        securityIssues,
        documentation
      };
    } catch (error) {
      console.error('Repository analysis error:', error);
      return {
        files: [],
        languages: {},
        complexity: 0,
        suggestions: [],
        securityIssues: [],
        documentation: ''
      };
    }
  }

  // Create AI-powered commit messages
  async generateCommitMessage(accessToken: string, owner: string, repo: string, changes: string[]): Promise<string> {
    try {
      // Analyze the changes
      const changeAnalysis = this.analyzeChanges(changes);
      
      // Generate conventional commit message
      const type = this.determineCommitType(changeAnalysis);
      const scope = this.determineCommitScope(changeAnalysis);
      const description = this.generateCommitDescription(changeAnalysis);
      
      return `${type}${scope ? `(${scope})` : ''}: ${description}`;
    } catch (error) {
      console.error('Commit message generation error:', error);
      return 'feat: update code';
    }
  }

  // Create pull request with AI analysis
  async createIntelligentPR(
    accessToken: string, 
    owner: string, 
    repo: string, 
    head: string, 
    base: string,
    title: string,
    changes: string[]
  ): Promise<{ success: boolean; url?: string; analysis?: any }> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      
      // Analyze changes for PR description
      const changeAnalysis = this.analyzeChanges(changes);
      const description = this.generatePRDescription(changeAnalysis);
      
      const { data: pr } = await octokit.rest.pulls.create({
        owner,
        repo,
        title,
        body: description,
        head,
        base
      });

      return {
        success: true,
        url: pr.html_url,
        analysis: changeAnalysis
      };
    } catch (error) {
      console.error('PR creation error:', error);
      return { success: false };
    }
  }

  // Monitor repository for changes
  async getRepositoryActivity(accessToken: string, owner: string, repo: string): Promise<any[]> {
    try {
      const octokit = new Octokit({ auth: accessToken });
      
      // Get recent commits
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 10
      });

      // Get recent issues
      const { data: issues } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 5
      });

      // Get recent pull requests
      const { data: prs } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 5
      });

      return [
        ...commits.map(commit => ({
          type: 'commit',
          message: commit.commit.message,
          author: commit.commit.author?.name,
          date: commit.commit.author?.date,
          url: commit.html_url
        })),
        ...issues.map(issue => ({
          type: 'issue',
          title: issue.title,
          state: issue.state,
          author: issue.user?.login,
          date: issue.created_at,
          url: issue.html_url
        })),
        ...prs.map(pr => ({
          type: 'pull_request',
          title: pr.title,
          state: pr.state,
          author: pr.user?.login,
          date: pr.created_at,
          url: pr.html_url
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Repository activity error:', error);
      return [];
    }
  }

  // Private helper methods
  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  private getLanguageFromExtension(extension: string): string {
    const extensionMap: { [key: string]: string } = {
      js: 'JavaScript',
      ts: 'TypeScript',
      py: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      go: 'Go',
      rs: 'Rust',
      php: 'PHP',
      rb: 'Ruby',
      swift: 'Swift',
      kt: 'Kotlin',
      dart: 'Dart',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      sql: 'SQL',
      json: 'JSON',
      xml: 'XML',
      md: 'Markdown',
      yaml: 'YAML',
      yml: 'YAML'
    };
    return extensionMap[extension.toLowerCase()] || 'Unknown';
  }

  private calculateRepositoryComplexity(files: string[], languages: { [key: string]: number }): number {
    const fileCount = files.length;
    const languageCount = Object.keys(languages).length;
    const avgFilesPerLanguage = fileCount / Math.max(1, languageCount);
    
    // Complexity formula based on file count, language diversity, and structure
    return Math.min(10, Math.round((fileCount / 10) + (languageCount * 0.5) + (avgFilesPerLanguage * 0.1)));
  }

  private generateCodeSuggestions(files: string[], languages: { [key: string]: number }): string[] {
    const suggestions: string[] = [];
    
    if (!files.some(f => f.toLowerCase().includes('readme'))) {
      suggestions.push('Add a comprehensive README.md file');
    }
    
    if (!files.some(f => f.includes('.gitignore'))) {
      suggestions.push('Add a .gitignore file to exclude unnecessary files');
    }
    
    if (languages['JavaScript'] && !files.some(f => f.includes('package.json'))) {
      suggestions.push('Add package.json for dependency management');
    }
    
    if (files.length > 20 && !files.some(f => f.toLowerCase().includes('test'))) {
      suggestions.push('Consider adding unit tests for better code coverage');
    }
    
    if (Object.keys(languages).length > 3) {
      suggestions.push('Consider consolidating languages to reduce complexity');
    }
    
    return suggestions;
  }

  private identifySecurityIssues(files: string[]): string[] {
    const issues: string[] = [];
    
    if (files.some(f => f.includes('.env') || f.includes('config.js'))) {
      issues.push('Potential exposure of sensitive configuration files');
    }
    
    if (files.some(f => f.includes('password') || f.includes('secret'))) {
      issues.push('Files with potentially sensitive names detected');
    }
    
    if (!files.some(f => f.includes('security') || f.includes('auth'))) {
      issues.push('No obvious security or authentication files found');
    }
    
    return issues;
  }

  private generateDocumentation(files: string[], languages: { [key: string]: number }): string {
    const primaryLanguage = Object.entries(languages).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
    const fileCount = files.length;
    
    return `# Repository Documentation

## Overview
This repository contains ${fileCount} files primarily written in ${primaryLanguage}.

## Languages Used
${Object.entries(languages).map(([lang, count]) => `- ${lang}: ${count} files`).join('\n')}

## File Structure
${files.slice(0, 10).map(file => `- ${file}`).join('\n')}
${files.length > 10 ? `... and ${files.length - 10} more files` : ''}

## Getting Started
1. Clone the repository
2. Install dependencies (if applicable)
3. Follow setup instructions in README.md

## Contributing
Please follow the project's coding standards and submit pull requests for review.
`;
  }

  private analyzeChanges(changes: string[]): any {
    const analysis = {
      addedFiles: changes.filter(c => c.startsWith('+')).length,
      deletedFiles: changes.filter(c => c.startsWith('-')).length,
      modifiedFiles: changes.filter(c => c.includes('modified')).length,
      categories: this.categorizeChanges(changes)
    };
    
    return analysis;
  }

  private categorizeChanges(changes: string[]): string[] {
    const categories: string[] = [];
    
    if (changes.some(c => c.includes('test'))) categories.push('testing');
    if (changes.some(c => c.includes('doc') || c.includes('readme'))) categories.push('documentation');
    if (changes.some(c => c.includes('fix') || c.includes('bug'))) categories.push('bugfix');
    if (changes.some(c => c.includes('feature') || c.includes('new'))) categories.push('feature');
    if (changes.some(c => c.includes('refactor'))) categories.push('refactor');
    if (changes.some(c => c.includes('style') || c.includes('format'))) categories.push('style');
    
    return categories.length > 0 ? categories : ['update'];
  }

  private determineCommitType(analysis: any): string {
    if (analysis.categories.includes('feature')) return 'feat';
    if (analysis.categories.includes('bugfix')) return 'fix';
    if (analysis.categories.includes('documentation')) return 'docs';
    if (analysis.categories.includes('style')) return 'style';
    if (analysis.categories.includes('refactor')) return 'refactor';
    if (analysis.categories.includes('testing')) return 'test';
    return 'chore';
  }

  private determineCommitScope(analysis: any): string | null {
    // Simple scope determination based on file patterns
    return null; // Can be enhanced to detect scope from file paths
  }

  private generateCommitDescription(analysis: any): string {
    const { addedFiles, deletedFiles, modifiedFiles, categories } = analysis;
    
    if (categories.includes('feature')) {
      return `add new functionality with ${addedFiles} new files`;
    }
    if (categories.includes('bugfix')) {
      return `resolve issues in ${modifiedFiles} files`;
    }
    if (categories.includes('documentation')) {
      return 'update project documentation';
    }
    
    return `update ${modifiedFiles} files`;
  }

  private generatePRDescription(analysis: any): string {
    const { addedFiles, deletedFiles, modifiedFiles, categories } = analysis;
    
    return `## Changes Summary

### Overview
This pull request includes the following changes:
- ${addedFiles} files added
- ${modifiedFiles} files modified  
- ${deletedFiles} files deleted

### Categories
${categories.map(cat => `- ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n')}

### Impact
This change affects the following areas:
- Code functionality
- Documentation
- Testing coverage

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Breaking changes documented

Please review and provide feedback.
`;
  }
}

export const githubService = new GitHubIntegrationService();