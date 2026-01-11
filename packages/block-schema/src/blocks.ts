import type { BlockDefinition } from './types.js';

export const blockCatalog: BlockDefinition[] = [
  {
    kind: 'hero-banner',
    category: 'structure',
    version: '1.0.0',
    meta: {
      title: 'Hero Banner',
      description: 'Full-width hero section with title, subtitle, and CTA',
      icon: '🦸'
    },
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true, placeholder: 'Welcome to our newsletter' },
      { name: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Add supporting copy' },
      { name: 'ctaLabel', label: 'CTA Label', type: 'string', placeholder: 'Read more' },
      { name: 'ctaUrl', label: 'CTA URL', type: 'url', placeholder: 'https://example.com' },
      { name: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#111827' }
    ],
    defaults: {
      title: 'Launch your next campaign',
      subtitle: 'Create and ship interactive blocks in minutes.',
      ctaLabel: 'Start building',
      ctaUrl: 'https://example.com',
      backgroundColor: '#0f172a'
    }
  },
  {
    kind: 'content-rich-text',
    category: 'content',
    version: '1.0.0',
    meta: {
      title: 'Rich Text',
      description: 'Flexible content block supporting paragraphs and lists',
      icon: '📝'
    },
    fields: [
      { name: 'body', label: 'Body', type: 'richtext', required: true },
      { name: 'alignment', label: 'Alignment', type: 'select', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ], defaultValue: 'left' }
    ],
    defaults: {
      body: '<p>Tell your story with rich typography and inline media.</p>',
      alignment: 'left'
    }
  },
  {
    kind: 'interactive-poll',
    category: 'interactive',
    version: '1.0.0',
    meta: {
      title: 'Quick Poll',
      description: 'Collect reader opinions directly in the newsletter',
      icon: '📊'
    },
    fields: [
      { name: 'question', label: 'Question', type: 'string', required: true },
      { name: 'options', label: 'Options', type: 'text', helperText: 'Comma separated options', required: true },
      { name: 'allowMultiple', label: 'Allow Multiple', type: 'select', options: [
        { label: 'No', value: 'false' },
        { label: 'Yes', value: 'true' }
      ], defaultValue: 'false' }
    ],
    defaults: {
      question: 'Which block should we build next?',
      options: 'Polls,Quizzes,Product carousels',
      allowMultiple: 'false'
    }
  },
  {
    kind: 'commerce-product',
    category: 'commerce',
    version: '1.0.0',
    meta: {
      title: 'Featured Product',
      description: 'Highlight a SKU with price + CTA',
      icon: '🛒'
    },
    fields: [
      { name: 'productName', label: 'Product Name', type: 'string', required: true },
      { name: 'price', label: 'Price', type: 'string', required: true, placeholder: '$49.00' },
      { name: 'imageUrl', label: 'Image URL', type: 'image' },
      { name: 'ctaLabel', label: 'CTA Label', type: 'string', defaultValue: 'Shop now' },
      { name: 'ctaUrl', label: 'CTA URL', type: 'url' }
    ],
    defaults: {
      productName: 'Limited edition drop',
      price: '$79',
      imageUrl: 'https://placehold.co/600x400',
      ctaLabel: 'Shop now',
      ctaUrl: 'https://example.com'
    }
  }
];
