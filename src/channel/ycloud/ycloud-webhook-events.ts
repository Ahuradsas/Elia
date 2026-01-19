/**
 * YCloud WhatsApp Webhook Event Interfaces
 * Based on YCloud API Documentation
 * @see https://docs.ycloud.com/reference/webhook-events-payloads
 */

// ========================================
// Base Event Interface
// ========================================

export interface IYCloudWebhookEvent<T = unknown> {
  id: string
  type: string
  apiVersion: 'v2'
  createTime: string
  data?: T
}

// ========================================
// Common Message Context
// ========================================

export interface IYCloudMessageContext {
  from: string
  id: string
  referred_product?: {
    catalog_id: string
    product_retailer_id: string
  }
}

export interface IYCloudCustomerProfile {
  name: string
}

// ========================================
// WhatsApp Inbound Message Event
// ========================================

export interface IYCloudWhatsAppInboundMessageEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.inbound_message.received'
  whatsappInboundMessage: IYCloudWhatsAppInboundMessage
}

export interface IYCloudWhatsAppInboundMessage {
  id: string
  wamid: string
  wabaId: string
  from: string
  to: string
  sendTime: string
  customerProfile: IYCloudCustomerProfile
  type: IYCloudWhatsAppMessageType
  text?: IYCloudTextContent
  image?: IYCloudMediaContent
  video?: IYCloudMediaContent
  audio?: IYCloudMediaContent
  document?: IYCloudDocumentContent
  sticker?: IYCloudMediaContent
  location?: IYCloudLocationContent
  contacts?: IYCloudContactContent[]
  reaction?: IYCloudReactionContent
  button?: IYCloudButtonContent
  interactive?: IYCloudInteractiveContent
  order?: IYCloudOrderContent
  system?: IYCloudSystemContent
  errors?: IYCloudMessageError[]
  referral?: IYCloudReferralContent
  context?: IYCloudMessageContext
}

export type IYCloudWhatsAppMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contacts'
  | 'reaction'
  | 'button'
  | 'interactive'
  | 'order'
  | 'system'
  | 'unsupported'
  | 'request_welcome'

export interface IYCloudTextContent {
  body: string
}

export interface IYCloudMediaContent {
  link: string
  id: string
  sha256: string
  mime_type: string
  caption?: string
}

export interface IYCloudDocumentContent extends IYCloudMediaContent {
  filename?: string
}

export interface IYCloudLocationContent {
  latitude: number
  longitude: number
  name?: string
  address?: string
  url?: string
}

export interface IYCloudContactContent {
  name: {
    formatted_name: string
    first_name?: string
    last_name?: string
    middle_name?: string
    prefix?: string
    suffix?: string
  }
  addresses?: IYCloudContactAddress[]
  birthday?: string
  emails?: IYCloudContactEmail[]
  phones?: IYCloudContactPhone[]
  org?: {
    company: string
    department: string
    title: string
  }
  urls?: IYCloudContactUrl[]
}

export interface IYCloudContactAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
  country_code: string
  type: 'HOME' | 'WORK'
}

export interface IYCloudContactEmail {
  email: string
  type: string
}

export interface IYCloudContactPhone {
  phone: string
  wa_id: string
  type: string
}

export interface IYCloudContactUrl {
  url: string
  type: string
}

export interface IYCloudReactionContent {
  message_id: string
  emoji?: string
}

export interface IYCloudButtonContent {
  payload: string
  text: string
}

export interface IYCloudInteractiveContent {
  type: 'list_reply' | 'button_reply' | 'nfm_reply'
  list_reply?: {
    id: string
    title: string
    description?: string
  }
  button_reply?: {
    id: string
    title: string
  }
  nfm_reply?: {
    name: string
    body: string
    response_json: string
  }
}

export interface IYCloudOrderContent {
  catalog_id: string
  product_items: IYCloudProductItem[]
  text?: string
}

export interface IYCloudProductItem {
  product_retailer_id: string
  quantity: string | number
  item_price: string | number
  currency: string
}

export interface IYCloudSystemContent {
  type: 'user_changed_number'
  body: string
  wa_id: string
}

export interface IYCloudMessageError {
  code: string
  title: string
}

export interface IYCloudReferralContent {
  source_url: string
  source_type: 'ad'
  source_id: string
  headline: string
  media_type: string
  image_url?: string
  ctwa_clid: string
}

// ========================================
// WhatsApp Message Updated Event
// ========================================

export interface IYCloudWhatsAppMessageUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.message.updated'
  whatsappMessage: IYCloudWhatsAppMessage
}

export interface IYCloudWhatsAppMessage {
  id: string
  wamid: string
  wabaId: string
  from: string
  to: string
  status: IYCloudMessageStatus
  type: string
  text?: IYCloudTextContent
  template?: IYCloudTemplateContent
  bizType: 'whatsapp'
  pricingCategory?: string
  pricingModel?: 'PMP'
  pricingType?: 'regular' | 'free_customer_service' | 'free_entry_point'
  totalPrice?: string
  currency?: 'USD'
  regionCode?: string
  conversation?: IYCloudConversationInfo
  externalId?: string
  createTime: string
  sendTime?: string
  deliverTime?: string
  readTime?: string
  errorCode?: string
  errorMessage?: string
  whatsappApiError?: IYCloudWhatsAppApiError
}

export type IYCloudMessageStatus =
  | 'accepted'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

export interface IYCloudTemplateContent {
  name: string
  language: {
    code: string
  }
}

export interface IYCloudConversationInfo {
  id: string
  origin: {
    type: string
  }
  expiration_timestamp?: string
}

export interface IYCloudWhatsAppApiError {
  message: string
  type: string
  code: number
  fbtrace_id: string
  error_data?: {
    details: string
  }
}

// ========================================
// WhatsApp Phone Number Events
// ========================================

export interface IYCloudWhatsAppPhoneNumberDeletedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.phone_number.deleted'
  whatsappPhoneNumber: IYCloudWhatsAppPhoneNumberDeleted
}

export interface IYCloudWhatsAppPhoneNumberDeleted {
  phoneNumber: string
  displayPhoneNumber: string
  wabaId: string
}

export interface IYCloudWhatsAppPhoneNumberNameUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.phone_number.name_updated'
  whatsappPhoneNumber: IYCloudWhatsAppPhoneNumberNameUpdate
}

export interface IYCloudWhatsAppPhoneNumberNameUpdate {
  phoneNumber: string
  displayPhoneNumber: string
  wabaId: string
  decision: string
  requestedVerifiedName: string
  rejectionReason?: string
  status: string
}

export interface IYCloudWhatsAppPhoneNumberQualityUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.phone_number.quality_updated'
  whatsappPhoneNumber: IYCloudWhatsAppPhoneNumberQualityUpdate
}

export interface IYCloudWhatsAppPhoneNumberQualityUpdate {
  phoneNumber: string
  displayPhoneNumber: string
  wabaId: string
  qualityRating: string
  messagingLimit: string
  whatsappBusinessManagerMessagingLimit?: string
  qualityUpdateEvent: string
  status: string
}

// ========================================
// WhatsApp Template Events
// ========================================

export interface IYCloudWhatsAppTemplateReviewedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.template.reviewed'
  whatsappTemplate: IYCloudWhatsAppTemplateReviewed
}

export interface IYCloudWhatsAppTemplateReviewed {
  wabaId: string
  name: string
  language: string
  category: string
  status: 'APPROVED' | 'REJECTED' | 'PAUSED' | 'PENDING_DELETION'
  reason?: string
  createTime: string
  updateTime: string
  statusUpdateEvent: string
}

export interface IYCloudWhatsAppTemplateCategoryUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.template.category_updated'
  whatsappTemplate: IYCloudWhatsAppTemplateCategoryUpdate
}

export interface IYCloudWhatsAppTemplateCategoryUpdate {
  wabaId: string
  name: string
  language: string
  category: string
  previousCategory: string
}

export interface IYCloudWhatsAppTemplateQualityUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.template.quality_updated'
  whatsappTemplate: IYCloudWhatsAppTemplateQualityUpdate
}

export interface IYCloudWhatsAppTemplateQualityUpdate {
  wabaId: string
  name: string
  language: string
  category: string
  status: string
  qualityRating: string
}

// ========================================
// WhatsApp Payment Events
// ========================================

export interface IYCloudWhatsAppPaymentUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.payment.updated'
  whatsappPayment: IYCloudWhatsAppPayment
}

export interface IYCloudWhatsAppPayment {
  wabaId: string
  referenceId: string
  status: 'captured' | 'pending'
  transactions: IYCloudPaymentTransaction[]
}

export interface IYCloudPaymentTransaction {
  id: string
  type: string
  status: string
  amount: {
    value: number
    offset: number
  }
  currency: string
  methodType?: string
  error?: {
    code: string
    message: string
  }
}

// ========================================
// WhatsApp Business Account Events
// ========================================

export interface IYCloudWhatsAppBusinessAccountDeletedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.business_account.deleted'
  whatsappBusinessAccount: IYCloudWhatsAppBusinessAccountDeleted
}

export interface IYCloudWhatsAppBusinessAccountDeleted {
  id: string
  name: string
}

export interface IYCloudWhatsAppBusinessAccountUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.business_account.updated'
  whatsappBusinessAccount: IYCloudWhatsAppBusinessAccountUpdate
}

export interface IYCloudWhatsAppBusinessAccountUpdate {
  id: string
  name: string
  accountReviewStatus: string
  updateEvent: string
  restrictions?: IYCloudAccountRestriction[]
  banState?: string
  banDate?: string
  violationType?: string
}

export interface IYCloudAccountRestriction {
  restrictionType: string
  restrictionInfo: string
}

// ========================================
// WhatsApp Business App Events
// ========================================

export interface IYCloudWhatsAppSmbHistoryEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.smb.history'
  whatsappInboundMessage?: IYCloudWhatsAppInboundMessage
  whatsappMessage?: IYCloudWhatsAppMessage
}

export interface IYCloudWhatsAppSmbMessageEchoesEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.smb.message.echoes'
  whatsappMessage: IYCloudWhatsAppMessage
}

export interface IYCloudWhatsAppSmbAppStateSyncEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.smb.app.state.sync'
  whatsappSmbAppStateSync: IYCloudWhatsAppSmbAppStateSync
}

export interface IYCloudWhatsAppSmbAppStateSync {
  wabaId: string
  phoneNumber: string
  stateSync: IYCloudStateSync[]
}

export interface IYCloudStateSync {
  contact: string
  action: string
  timestamp: string
}

export interface IYCloudWhatsAppUserPreferencesEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.user.preferences'
  whatsappUserPreference: IYCloudWhatsAppUserPreference
}

export interface IYCloudWhatsAppUserPreference {
  wabaId: string
  businessPhoneNumber: string
  businessPhoneId: string
  contactName: string
  contactPhoneNumber: string
  detail: string
  category: string
  value: string
  timestamp: string
}

// ========================================
// Union Type for All WhatsApp Events
// ========================================

export type IYCloudWhatsAppEvent =
  | IYCloudWhatsAppInboundMessageEvent
  | IYCloudWhatsAppMessageUpdatedEvent
  | IYCloudWhatsAppPhoneNumberDeletedEvent
  | IYCloudWhatsAppPhoneNumberNameUpdatedEvent
  | IYCloudWhatsAppPhoneNumberQualityUpdatedEvent
  | IYCloudWhatsAppTemplateReviewedEvent
  | IYCloudWhatsAppTemplateCategoryUpdatedEvent
  | IYCloudWhatsAppTemplateQualityUpdatedEvent
  | IYCloudWhatsAppPaymentUpdatedEvent
  | IYCloudWhatsAppBusinessAccountDeletedEvent
  | IYCloudWhatsAppBusinessAccountUpdatedEvent
  | IYCloudWhatsAppSmbHistoryEvent
  | IYCloudWhatsAppSmbMessageEchoesEvent
  | IYCloudWhatsAppSmbAppStateSyncEvent
  | IYCloudWhatsAppUserPreferencesEvent
