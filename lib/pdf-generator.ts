// ============================================
// PDF GENERATOR
// ============================================
// Generates PDF documents from extracted playbooks
// using @react-pdf/renderer
// ============================================

import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { SalesPlaybook, SupportGuide } from './extractor';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  titlePage: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  date: {
    fontSize: 10,
    color: '#888',
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginTop: 25,
    marginBottom: 12,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  item: {
    marginBottom: 12,
    paddingLeft: 10,
  },
  itemLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 3,
  },
  itemText: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.6,
  },
  bulletItem: {
    marginBottom: 6,
    paddingLeft: 15,
    fontSize: 10,
    color: '#333',
  },
  bulletPoint: {
    position: 'absolute',
    left: 0,
  },
  tocTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
  },
  tocItem: {
    fontSize: 12,
    marginBottom: 8,
    color: '#333',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    fontSize: 8,
    color: '#aaa',
  },
});

// ============================================
// SALES PLAYBOOK PDF
// ============================================

interface SalesPlaybookPDFProps {
  playbook: SalesPlaybook;
}

const SalesPlaybookPDF: React.FC<SalesPlaybookPDFProps> = ({ playbook }) => {
  const generatedDate = new Date(playbook.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return React.createElement(
    Document,
    null,
    // Title Page
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.titlePage },
        React.createElement(Text, { style: styles.title }, 'Sales Playbook'),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Extracted from ${playbook.transcriptCount} transcripts`
        ),
        React.createElement(Text, { style: styles.date }, `Generated: ${generatedDate}`)
      )
    ),

    // Table of Contents
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.tocTitle }, 'Table of Contents'),
      React.createElement(Text, { style: styles.tocItem }, '1. Common Objections & Winning Responses'),
      React.createElement(Text, { style: styles.tocItem }, '2. Successful Closing Patterns'),
      React.createElement(Text, { style: styles.tocItem }, '3. Value Proposition Explanations'),
      React.createElement(Text, { style: styles.tocItem }, '4. Rapport-Building Techniques'),
      React.createElement(Text, { style: styles.tocItem }, '5. Phrases to Avoid'),
      React.createElement(Text, { style: styles.tocItem }, '6. Key Product Questions & Answers')
    ),

    // Content Pages
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Section 1: Objections
      React.createElement(Text, { style: styles.sectionTitle }, '1. Common Objections & Winning Responses'),
      ...playbook.objections.map((item, i) =>
        React.createElement(
          View,
          { key: `obj-${i}`, style: styles.item },
          React.createElement(Text, { style: styles.itemLabel }, `Objection: "${item.objection}"`),
          React.createElement(Text, { style: styles.itemText }, `Response: ${item.winningResponse}`)
        )
      ),

      // Section 2: Closing Patterns
      React.createElement(Text, { style: styles.sectionTitle }, '2. Successful Closing Patterns'),
      ...playbook.closingPatterns.map((pattern, i) =>
        React.createElement(Text, { key: `close-${i}`, style: styles.bulletItem }, `• ${pattern}`)
      ),

      React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }),
      React.createElement(Text, { style: styles.footer }, 'AI Sales Rep Simulator - Sales Playbook')
    ),

    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Section 3: Value Propositions
      React.createElement(Text, { style: styles.sectionTitle }, '3. Value Proposition Explanations'),
      ...playbook.valuePropositions.map((vp, i) =>
        React.createElement(Text, { key: `vp-${i}`, style: styles.bulletItem }, `• ${vp}`)
      ),

      // Section 4: Rapport Building
      React.createElement(Text, { style: styles.sectionTitle }, '4. Rapport-Building Techniques'),
      ...playbook.rapportBuilding.map((rb, i) =>
        React.createElement(Text, { key: `rb-${i}`, style: styles.bulletItem }, `• ${rb}`)
      ),

      // Section 5: Phrases to Avoid
      React.createElement(Text, { style: styles.sectionTitle }, '5. Phrases to Avoid'),
      ...playbook.phrasesToAvoid.map((phrase, i) =>
        React.createElement(Text, { key: `avoid-${i}`, style: styles.bulletItem }, `• ${phrase}`)
      ),

      React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }),
      React.createElement(Text, { style: styles.footer }, 'AI Sales Rep Simulator - Sales Playbook')
    ),

    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Section 6: Q&A
      React.createElement(Text, { style: styles.sectionTitle }, '6. Key Product Questions & Best Answers'),
      ...playbook.keyQuestionsAnswers.map((qa, i) =>
        React.createElement(
          View,
          { key: `qa-${i}`, style: styles.item },
          React.createElement(Text, { style: styles.itemLabel }, `Q: ${qa.question}`),
          React.createElement(Text, { style: styles.itemText }, `A: ${qa.answer}`)
        )
      ),

      React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }),
      React.createElement(Text, { style: styles.footer }, 'AI Sales Rep Simulator - Sales Playbook')
    )
  );
};

// ============================================
// SUPPORT GUIDE PDF
// ============================================

interface SupportGuidePDFProps {
  guide: SupportGuide;
}

const SupportGuidePDF: React.FC<SupportGuidePDFProps> = ({ guide }) => {
  const generatedDate = new Date(guide.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return React.createElement(
    Document,
    null,
    // Title Page
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.titlePage },
        React.createElement(Text, { style: styles.title }, 'FAQ & Issue Resolution Guide'),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Extracted from ${guide.ticketCount} support tickets`
        ),
        React.createElement(Text, { style: styles.date }, `Generated: ${generatedDate}`)
      )
    ),

    // Table of Contents
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.tocTitle }, 'Table of Contents'),
      React.createElement(Text, { style: styles.tocItem }, '1. Frequently Asked Questions'),
      React.createElement(Text, { style: styles.tocItem }, '2. Common Issues & Resolutions'),
      React.createElement(Text, { style: styles.tocItem }, '3. Product Friction Points'),
      React.createElement(Text, { style: styles.tocItem }, '4. Response Templates'),
      React.createElement(Text, { style: styles.tocItem }, '5. Escalation Triggers'),
      React.createElement(Text, { style: styles.tocItem }, '6. Feature Requests')
    ),

    // Content Pages
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Section 1: FAQs
      React.createElement(Text, { style: styles.sectionTitle }, '1. Frequently Asked Questions'),
      ...guide.faqs.map((faq, i) =>
        React.createElement(
          View,
          { key: `faq-${i}`, style: styles.item },
          React.createElement(Text, { style: styles.itemLabel }, `Q: ${faq.question}`),
          React.createElement(Text, { style: styles.itemText }, `A: ${faq.answer}`)
        )
      ),

      React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }),
      React.createElement(Text, { style: styles.footer }, 'AI Sales Rep Simulator - Support Guide')
    ),

    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Section 2: Issues & Resolutions
      React.createElement(Text, { style: styles.sectionTitle }, '2. Common Issues & Resolutions'),
      ...guide.issuesResolutions.map((issue, i) =>
        React.createElement(
          View,
          { key: `issue-${i}`, style: styles.item },
          React.createElement(Text, { style: styles.itemLabel }, `Issue: ${issue.issue}`),
          React.createElement(Text, { style: styles.itemText }, `Resolution: ${issue.resolution}`),
          issue.prevention && React.createElement(Text, { style: styles.itemText }, `Prevention: ${issue.prevention}`)
        )
      ),

      // Section 3: Friction Points
      React.createElement(Text, { style: styles.sectionTitle }, '3. Product Friction Points'),
      ...guide.frictionPoints.map((fp, i) =>
        React.createElement(Text, { key: `fp-${i}`, style: styles.bulletItem }, `• ${fp}`)
      ),

      React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }),
      React.createElement(Text, { style: styles.footer }, 'AI Sales Rep Simulator - Support Guide')
    ),

    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Section 4: Response Templates
      React.createElement(Text, { style: styles.sectionTitle }, '4. Response Templates'),
      ...guide.responseTemplates.map((template, i) =>
        React.createElement(Text, { key: `template-${i}`, style: styles.bulletItem }, `• ${template}`)
      ),

      // Section 5: Escalation Triggers
      React.createElement(Text, { style: styles.sectionTitle }, '5. Escalation Triggers'),
      ...guide.escalationTriggers.map((trigger, i) =>
        React.createElement(Text, { key: `trigger-${i}`, style: styles.bulletItem }, `• ${trigger}`)
      ),

      // Section 6: Feature Requests
      React.createElement(Text, { style: styles.sectionTitle }, '6. Feature Requests'),
      ...guide.featureRequests.map((fr, i) =>
        React.createElement(Text, { key: `fr-${i}`, style: styles.bulletItem }, `• ${fr}`)
      ),

      React.createElement(Text, { style: styles.pageNumber, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}` }),
      React.createElement(Text, { style: styles.footer }, 'AI Sales Rep Simulator - Support Guide')
    )
  );
};

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Generate PDF buffer for Sales Playbook
 */
export async function generateSalesPlaybookPDF(playbook: SalesPlaybook): Promise<Buffer> {
  const doc = React.createElement(SalesPlaybookPDF, { playbook });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await renderToBuffer(doc as any);
}

/**
 * Generate PDF buffer for Support Guide
 */
export async function generateSupportGuidePDF(guide: SupportGuide): Promise<Buffer> {
  const doc = React.createElement(SupportGuidePDF, { guide });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await renderToBuffer(doc as any);
}


