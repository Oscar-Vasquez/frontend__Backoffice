export interface EmailElementOptions {
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize?: number;
  fontName?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  isItalic?: boolean;
  isBold?: boolean;
  isUnderline?: boolean;
  imageUrl?: string;
  type?: string;
  backgroundColor?: string;
  // Opciones específicas para texto
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  // Opciones específicas para botón
  href?: string;
  buttonStyle?: 'solid' | 'outline' | 'ghost';
  borderRadius?: number;
  hoverEffect?: boolean;
  width?: string;
  height?: string;
  buttonAlignment?: 'left' | 'center' | 'right';
  // Opciones específicas para divisor
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  dividerColor?: string;
  dividerWidth?: number;
  dividerHeight?: number;
  // Opciones específicas para footer
  footerColumns?: number;
  footerGap?: number;
  footerElements?: EmailElement[];
  footerStyle?: 'simple' | 'columns' | 'social';
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  unsubscribeLink?: string;
  footerDisclaimer?: string;
}

export interface EmailElement {
  id: string;
  type: 'text' | 'columns' | 'image' | 'button' | 'divider' | 'footer' | 'bulletpoint';
  content: string;
  backgroundColor?: string;
  columns?: number;
  gap?: number;
  elements?: EmailElement[][];
  options?: {
    padding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    fontSize?: number;
    fontName?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    isItalic?: boolean;
    isBold?: boolean;
    isUnderline?: boolean;
    imageUrl?: string;
    type?: string;
    backgroundColor?: string;
    href?: string;
    buttonStyle?: 'solid' | 'outline' | 'ghost';
    borderRadius?: number;
    dividerStyle?: 'solid' | 'dashed' | 'dotted';
    dividerColor?: string;
    dividerWidth?: number;
    dividerHeight?: number;
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline' | 'line-through';
    fontWeight?: number;
    fontStyle?: string;
    width?: string;
    height?: string;
    hoverEffect?: boolean;
    buttonAlignment?: 'left' | 'center' | 'right';
    footerColumns?: number;
    footerGap?: number;
    footerElements?: EmailElement[];
    footerStyle?: 'simple' | 'columns' | 'social';
    companyInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      website?: string;
    };
    unsubscribeLink?: string;
    footerDisclaimer?: string;
    bulletStyle?: 'disc' | 'circle' | 'square';
    bulletColor?: string;
    bulletSize?: number;
    items?: string[];
    gap?: number;
  };
}

export interface EditorSettings {
  width: number | '100%';
  backgroundColor: string;
  contentPadding: number;
  contentBackground: string;
  contentBorderRadius: number;
  contentMaxWidth: number;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  elements: EmailElement[];
  editorSettings: EditorSettings;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  category?: string;
  description?: string;
}

export interface EmailRecipient {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface EmailCampaignMetrics {
  openRate: number;
  totalClicks: number;
  bounceRate: number;
  responseRate: number;
  totalOpens: number;
  uniqueOpens: number;
  totalRecipients: number;
  deliveredCount: number;
  bouncedCount: number;
  responseCount: number;
  lastUpdated: Date;
}

export interface EmailCampaign {
  id?: string;
  name: string;
  templateId: string;
  subject: string;
  recipients: EmailRecipient[];
  sendToAll: boolean;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledDate?: Date;
  sentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  metrics?: EmailCampaignMetrics;
}

export interface EmailSendResult {
  success: boolean;
  recipientId: string;
  messageId?: string;
  error?: string;
  sentAt: Date;
}

export interface EmailCampaignStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  openRate: string;
  clickRate: string;
  bounceRate: string;
  replyRate: string;
} 