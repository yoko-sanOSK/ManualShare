
export type ManualCategory = 'IT' | 'HR' | 'Sales' | 'Operations' | 'Finance';

export interface Manual {
  id: string;
  title: string;
  category: ManualCategory;
  description: string;
  lastUpdated: string;
  content: string;
  imageUrl?: string;
}

export const CATEGORIES: ManualCategory[] = ['IT', 'HR', 'Sales', 'Operations', 'Finance'];

export const MOCK_MANUALS: Manual[] = [
  {
    id: '1',
    title: 'Remote Work Onboarding Guide',
    category: 'HR',
    description: 'A comprehensive guide for new employees starting in a remote environment.',
    lastUpdated: '2023-11-15',
    imageUrl: 'https://picsum.photos/seed/hr-manual/600/400',
    content: `
      # Welcome to the Team
      
      Setting up your home office is the first step to success. Ensure you have a stable internet connection and a quiet workspace.
      
      ## Communication Channels
      We primarily use Slack for daily communication and Zoom for meetings.
      - **Slack**: Used for informal chats and quick questions.
      - **Zoom**: Used for formal meetings and one-on-ones.
      - **Email**: Used for formal external communications.

      ## Working Hours
      Our core hours are from 10:00 AM to 4:00 PM JST. Outside of these hours, you are free to manage your own time as long as your tasks are completed.

      ## Equipment Request
      If you need additional equipment like monitors or ergonomic chairs, please fill out the equipment request form on the company portal.
      
      ## Health and Wellbeing
      Take regular breaks. We provide a stipend for gym memberships or meditation app subscriptions.
    `
  },
  {
    id: '2',
    title: 'Security Compliance 101',
    category: 'IT',
    description: 'Essential security protocols for all staff members.',
    lastUpdated: '2024-01-20',
    imageUrl: 'https://picsum.photos/seed/it-manual/600/400',
    content: `
      # IT Security Protocol
      
      Maintaining data security is everyone's responsibility. Failure to follow these steps can lead to severe vulnerabilities.

      ## Password Management
      - Use a unique password for every service.
      - Use our approved password manager (1Password).
      - Minimum 12 characters, including symbols.

      ## Two-Factor Authentication (2FA)
      2FA is mandatory for all company accounts. We prefer hardware keys (YubiKey) but also accept authenticator apps. SMS-based 2FA is prohibited.

      ## Handling Phishing
      If you receive a suspicious email:
      1. Do not click any links.
      2. Do not download attachments.
      3. Use the 'Report Phishing' button in Outlook/Gmail.

      ## Secure Hardware
      Never leave your laptop unattended in public places. Ensure your disk is encrypted.
    `
  },
  {
    id: '3',
    title: 'Sales CRM Mastery',
    category: 'Sales',
    description: 'Optimizing your pipeline using our internal CRM tools.',
    lastUpdated: '2023-12-01',
    imageUrl: 'https://picsum.photos/seed/sales-manual/600/400',
    content: `
      # CRM Workflow Optimization
      
      This manual covers the efficient use of our Salesforce integration to track leads and close deals.

      ## Lead Qualification
      Every lead must be qualified within 24 hours of entry. Use the BANT framework:
      - **Budget**: Does the lead have the budget?
      - **Authority**: Is the lead the decision-maker?
      - **Need**: Is there a specific pain point we solve?
      - **Timeline**: When are they looking to implement a solution?

      ## Managing the Pipeline
      Move deals through the stages: Discovery -> Demo -> Proposal -> Negotiation -> Closed.
      Ensure notes are updated after every call.

      ## Reporting
      Monthly reports are generated automatically. Ensure your "Estimated Close Date" is accurate by the 25th of each month.
    `
  },
  {
    id: '4',
    title: 'Inventory Control Procedures',
    category: 'Operations',
    description: 'Standard operating procedures for warehouse and stock management.',
    lastUpdated: '2023-10-22',
    imageUrl: 'https://picsum.photos/seed/ops-manual/600/400',
    content: `
      # Inventory Management SOP
      
      Standard procedures for handling incoming and outgoing stock at our regional hubs.

      ## Receiving Shipments
      1. Inspect pallet for damage.
      2. Verify SKU counts against the manifest.
      3. Log discrepancies in the ERP system immediately.

      ## Storage Best Practices
      - FIFO (First-In, First-Out) must be strictly followed for perishable items.
      - High-velocity items should be stored near the loading bay for faster dispatch.

      ## Safety Protocols
      - Wear high-visibility vests at all times.
      - Forklift operation requires valid internal certification.
      - Report any spills or hazards to the floor supervisor.
    `
  }
];
