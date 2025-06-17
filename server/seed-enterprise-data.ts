import { db } from './db';
import { aiModels, businessTemplates } from '../shared/schema';

async function seedEnterpriseData() {
  console.log('Seeding enterprise data...');

  // Seed AI Models
  const models = [
    {
      name: 'Grok-2 Vision',
      provider: 'xai',
      modelId: 'grok-2-vision-1212',
      maxTokens: 8192,
      temperature: '0.7',
      systemPrompt: 'You are Grok, a helpful AI assistant with access to real-time information and the ability to process both text and images.',
      isActive: true,
      licenseRequired: 'pro'
    },
    {
      name: 'Grok-2',
      provider: 'xai',
      modelId: 'grok-2-1212',
      maxTokens: 131072,
      temperature: '0.7',
      systemPrompt: 'You are Grok, a helpful AI assistant with extensive knowledge and reasoning capabilities.',
      isActive: true,
      licenseRequired: 'free'
    },
    {
      name: 'Grok Vision Beta',
      provider: 'xai',
      modelId: 'grok-vision-beta',
      maxTokens: 8192,
      temperature: '0.7',
      systemPrompt: 'You are Grok Vision, capable of understanding and analyzing both text and visual content.',
      isActive: true,
      licenseRequired: 'pro'
    },
    {
      name: 'Grok Beta',
      provider: 'xai',
      modelId: 'grok-beta',
      maxTokens: 131072,
      temperature: '0.7',
      systemPrompt: 'You are Grok, designed to be helpful, harmless, and honest in all interactions.',
      isActive: true,
      licenseRequired: 'free'
    }
  ];

  for (const model of models) {
    try {
      await db.insert(aiModels).values(model).onConflictDoNothing();
      console.log(`✓ Added AI model: ${model.name}`);
    } catch (error) {
      console.log(`- Model ${model.name} already exists`);
    }
  }

  // Seed Business Templates
  const templates = [
    {
      name: 'Business Proposal',
      category: 'proposal',
      description: 'Professional business proposal template',
      template: `# Business Proposal: {{project_name}}

## Executive Summary
{{executive_summary}}

## Project Overview
**Client:** {{client_name}}
**Project Duration:** {{duration}}
**Total Investment:** {{budget}}

## Objectives
{{objectives}}

## Deliverables
{{deliverables}}

## Timeline
{{timeline}}

## Investment & ROI
{{investment_details}}

## Next Steps
{{next_steps}}

---
*Prepared by {{company_name}} on {{date}}*`,
      variables: {
        project_name: 'string',
        client_name: 'string',
        executive_summary: 'text',
        duration: 'string',
        budget: 'string',
        objectives: 'text',
        deliverables: 'text',
        timeline: 'text',
        investment_details: 'text',
        next_steps: 'text',
        company_name: 'string',
        date: 'date'
      },
      licenseRequired: 'pro',
      isPublic: true,
      usageCount: 0
    },
    {
      name: 'Technical Documentation',
      category: 'documentation',
      description: 'Comprehensive technical documentation template',
      template: `# {{product_name}} Technical Documentation

## Overview
{{overview}}

## Architecture
{{architecture_description}}

## API Reference
{{api_reference}}

## Installation Guide
{{installation_guide}}

## Configuration
{{configuration_details}}

## Usage Examples
{{usage_examples}}

## Troubleshooting
{{troubleshooting}}

## Support
{{support_information}}`,
      variables: {
        product_name: 'string',
        overview: 'text',
        architecture_description: 'text',
        api_reference: 'text',
        installation_guide: 'text',
        configuration_details: 'text',
        usage_examples: 'text',
        troubleshooting: 'text',
        support_information: 'text'
      },
      licenseRequired: 'free',
      isPublic: true,
      usageCount: 0
    },
    {
      name: 'Marketing Email',
      category: 'email',
      description: 'Professional marketing email template',
      template: `Subject: {{email_subject}}

Dear {{recipient_name}},

{{opening_line}}

{{main_message}}

**Key Benefits:**
{{key_benefits}}

{{call_to_action}}

Best regards,
{{sender_name}}
{{company_name}}

{{footer_information}}`,
      variables: {
        email_subject: 'string',
        recipient_name: 'string',
        opening_line: 'text',
        main_message: 'text',
        key_benefits: 'text',
        call_to_action: 'text',
        sender_name: 'string',
        company_name: 'string',
        footer_information: 'text'
      },
      licenseRequired: 'pro',
      isPublic: true,
      usageCount: 0
    },
    {
      name: 'Project Report',
      category: 'report',
      description: 'Detailed project status report template',
      template: `# Project Status Report: {{project_name}}

**Report Date:** {{report_date}}
**Project Manager:** {{project_manager}}
**Reporting Period:** {{reporting_period}}

## Executive Summary
{{executive_summary}}

## Project Progress
**Overall Progress:** {{overall_progress}}%
**Milestones Completed:** {{milestones_completed}}
**Current Phase:** {{current_phase}}

## Key Achievements
{{key_achievements}}

## Challenges & Risks
{{challenges_risks}}

## Resource Utilization
{{resource_utilization}}

## Budget Status
**Budget Allocated:** {{budget_allocated}}
**Budget Spent:** {{budget_spent}}
**Remaining Budget:** {{remaining_budget}}

## Next Period Objectives
{{next_objectives}}

## Recommendations
{{recommendations}}`,
      variables: {
        project_name: 'string',
        report_date: 'date',
        project_manager: 'string',
        reporting_period: 'string',
        executive_summary: 'text',
        overall_progress: 'number',
        milestones_completed: 'text',
        current_phase: 'string',
        key_achievements: 'text',
        challenges_risks: 'text',
        resource_utilization: 'text',
        budget_allocated: 'string',
        budget_spent: 'string',
        remaining_budget: 'string',
        next_objectives: 'text',
        recommendations: 'text'
      },
      licenseRequired: 'enterprise',
      isPublic: true,
      usageCount: 0
    },
    {
      name: 'Code Review Report',
      category: 'technical',
      description: 'Comprehensive code review and analysis report',
      template: `# Code Review Report

**Repository:** {{repository_name}}
**Review Date:** {{review_date}}
**Reviewer:** {{reviewer_name}}
**Branch/Commit:** {{branch_commit}}

## Summary
{{review_summary}}

## Code Quality Metrics
- **Overall Score:** {{quality_score}}/100
- **Lines of Code:** {{lines_of_code}}
- **Complexity Score:** {{complexity_score}}
- **Test Coverage:** {{test_coverage}}%

## Findings

### ✅ Strengths
{{strengths}}

### ⚠️ Areas for Improvement
{{improvements}}

### 🚨 Critical Issues
{{critical_issues}}

## Security Analysis
{{security_analysis}}

## Performance Considerations
{{performance_notes}}

## Recommendations
{{recommendations}}

## Action Items
{{action_items}}`,
      variables: {
        repository_name: 'string',
        review_date: 'date',
        reviewer_name: 'string',
        branch_commit: 'string',
        review_summary: 'text',
        quality_score: 'number',
        lines_of_code: 'number',
        complexity_score: 'number',
        test_coverage: 'number',
        strengths: 'text',
        improvements: 'text',
        critical_issues: 'text',
        security_analysis: 'text',
        performance_notes: 'text',
        recommendations: 'text',
        action_items: 'text'
      },
      licenseRequired: 'pro',
      isPublic: true,
      usageCount: 0
    }
  ];

  for (const template of templates) {
    try {
      await db.insert(businessTemplates).values(template).onConflictDoNothing();
      console.log(`✓ Added business template: ${template.name}`);
    } catch (error) {
      console.log(`- Template ${template.name} already exists`);
    }
  }

  console.log('✅ Enterprise data seeding completed!');
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnterpriseData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedEnterpriseData };