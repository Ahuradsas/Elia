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

export interface IMessageContext {
  from: string
  id: string
  referred_product?: {
    catalog_id: string
    product_retailer_id: string
  }
}

export interface ICustomerProfile {
  name: string
}

// ========================================
// WhatsApp Inbound Message Event
// ========================================

export interface IWhatsAppInboundMessageEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.inbound_message.received'
  whatsappInboundMessage: IWhatsAppInboundMessage
}

export interface IWhatsAppInboundMessage {
  id: string
  wamid: string
  wabaId: string
  from: string
  to: string
  sendTime: string
  customerProfile: ICustomerProfile
  type: IWhatsAppMessageType
  text?: ITextContent
  image?: IMediaContent
  video?: IMediaContent
  audio?: IMediaContent
  document?: IDocumentContent
  sticker?: IMediaContent
  location?: ILocationContent
  contacts?: IContactContent[]
  reaction?: IReactionContent
  button?: IButtonContent
  interactive?: IInteractiveContent
  order?: IOrderContent
  system?: ISystemContent
  errors?: IMessageError[]
  referral?: IReferralContent
  context?: IMessageContext
}

export type IWhatsAppMessageType =
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

export interface ITextContent {
  body: string
}

export interface IMediaContent {
  link: string
  id: string
  sha256: string
  mime_type: string
  caption?: string
}

export interface IDocumentContent extends IMediaContent {
  filename?: string
}

export interface ILocationContent {
  latitude: number
  longitude: number
  name?: string
  address?: string
  url?: string
}

export interface IContactContent {
  name: {
    formatted_name: string
    first_name?: string
    last_name?: string
    middle_name?: string
    prefix?: string
    suffix?: string
  }
  addresses?: IContactAddress[]
  birthday?: string
  emails?: IContactEmail[]
  phones?: IContactPhone[]
  org?: {
    company: string
    department: string
    title: string
  }
  urls?: IContactUrl[]
}

export interface IContactAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
  country_code: string
  type: 'HOME' | 'WORK'
}

export interface IContactEmail {
  email: string
  type: string
}

export interface IContactPhone {
  phone: string
  wa_id: string
  type: string
}

export interface IContactUrl {
  url: string
  type: string
}

export interface IReactionContent {
  message_id: string
  emoji?: string
}

export interface IButtonContent {
  payload: string
  text: string
}

export interface IInteractiveContent {
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

export interface IOrderContent {
  catalog_id: string
  product_items: IProductItem[]
  text?: string
}

export interface IProductItem {
  product_retailer_id: string
  quantity: string | number
  item_price: string | number
  currency: string
}

export interface ISystemContent {
  type: 'user_changed_number'
  body: string
  wa_id: string
}

export interface IMessageError {
  code: string
  title: string
}

export interface IReferralContent {
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

export interface IWhatsAppMessageUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.message.updated'
  whatsappMessage: IWhatsAppMessage
}

export interface IWhatsAppMessage {
  id: string
  wamid: string
  wabaId: string
  from: string
  to: string
  status: IMessageStatus
  type: string
  text?: ITextContent
  template?: ITemplateContent
  bizType: 'whatsapp'
  pricingCategory?: string
  pricingModel?: 'PMP'
  pricingType?: 'regular' | 'free_customer_service' | 'free_entry_point'
  totalPrice?: string
  currency?: 'USD'
  regionCode?: string
  conversation?: IConversationInfo
  externalId?: string
  createTime: string
  sendTime?: string
  deliverTime?: string
  readTime?: string
  errorCode?: string
  errorMessage?: string
  whatsappApiError?: IWhatsAppApiError
}

export type IMessageStatus =
  | 'accepted'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'

export interface ITemplateContent {
  name: string
  language: {
    code: string
  }
}

export interface IConversationInfo {
  id: string
  origin: {
    type: string
  }
  expiration_timestamp?: string
}

export interface IWhatsAppApiError {
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

export interface IWhatsAppPhoneNumberDeletedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.phone_number.deleted'
  whatsappPhoneNumber: IWhatsAppPhoneNumberDeleted
}

export interface IWhatsAppPhoneNumberDeleted {
  phoneNumber: string
  displayPhoneNumber: string
  wabaId: string
}

export interface IWhatsAppPhoneNumberNameUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.phone_number.name_updated'
  whatsappPhoneNumber: IWhatsAppPhoneNumberNameUpdate
}

export interface IWhatsAppPhoneNumberNameUpdate {
  phoneNumber: string
  displayPhoneNumber: string
  wabaId: string
  decision: string
  requestedVerifiedName: string
  rejectionReason?: string
  status: string
}

export interface IWhatsAppPhoneNumberQualityUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.phone_number.quality_updated'
  whatsappPhoneNumber: IWhatsAppPhoneNumberQualityUpdate
}

export interface IWhatsAppPhoneNumberQualityUpdate {
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

export interface IWhatsAppTemplateReviewedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.template.reviewed'
  whatsappTemplate: IWhatsAppTemplateReviewed
}

export interface IWhatsAppTemplateReviewed {
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

export interface IWhatsAppTemplateCategoryUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.template.category_updated'
  whatsappTemplate: IWhatsAppTemplateCategoryUpdate
}

export interface IWhatsAppTemplateCategoryUpdate {
  wabaId: string
  name: string
  language: string
  category: string
  previousCategory: string
}

export interface IWhatsAppTemplateQualityUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.template.quality_updated'
  whatsappTemplate: IWhatsAppTemplateQualityUpdate
}

export interface IWhatsAppTemplateQualityUpdate {
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

export interface IWhatsAppPaymentUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.payment.updated'
  whatsappPayment: IWhatsAppPayment
}

export interface IWhatsAppPayment {
  wabaId: string
  referenceId: string
  status: 'captured' | 'pending'
  transactions: IPaymentTransaction[]
}

export interface IPaymentTransaction {
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

export interface IWhatsAppBusinessAccountDeletedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.business_account.deleted'
  whatsappBusinessAccount: IWhatsAppBusinessAccountDeleted
}

export interface IWhatsAppBusinessAccountDeleted {
  id: string
  name: string
}

export interface IWhatsAppBusinessAccountUpdatedEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.business_account.updated'
  whatsappBusinessAccount: IWhatsAppBusinessAccountUpdate
}

export interface IWhatsAppBusinessAccountUpdate {
  id: string
  name: string
  accountReviewStatus: string
  updateEvent: string
  restrictions?: IAccountRestriction[]
  banState?: string
  banDate?: string
  violationType?: string
}

export interface IAccountRestriction {
  restrictionType: string
  restrictionInfo: string
}

// ========================================
// WhatsApp Business App Events
// ========================================

export interface IWhatsAppSmbHistoryEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.smb.history'
  whatsappInboundMessage?: IWhatsAppInboundMessage
  whatsappMessage?: IWhatsAppMessage
}

export interface IWhatsAppSmbMessageEchoesEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.smb.message.echoes'
  whatsappMessage: IWhatsAppMessage
}

export interface IWhatsAppSmbAppStateSyncEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.smb.app.state.sync'
  whatsappSmbAppStateSync: IWhatsAppSmbAppStateSync
}

export interface IWhatsAppSmbAppStateSync {
  wabaId: string
  phoneNumber: string
  stateSync: IStateSync[]
}

export interface IStateSync {
  contact: string
  action: string
  timestamp: string
}

export interface IWhatsAppUserPreferencesEvent extends IYCloudWebhookEvent<never> {
  type: 'whatsapp.user.preferences'
  whatsappUserPreference: IWhatsAppUserPreference
}

export interface IWhatsAppUserPreference {
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
  | IWhatsAppInboundMessageEvent
  | IWhatsAppMessageUpdatedEvent
  | IWhatsAppPhoneNumberDeletedEvent
  | IWhatsAppPhoneNumberNameUpdatedEvent
  | IWhatsAppPhoneNumberQualityUpdatedEvent
  | IWhatsAppTemplateReviewedEvent
  | IWhatsAppTemplateCategoryUpdatedEvent
  | IWhatsAppTemplateQualityUpdatedEvent
  | IWhatsAppPaymentUpdatedEvent
  | IWhatsAppBusinessAccountDeletedEvent
  | IWhatsAppBusinessAccountUpdatedEvent
  | IWhatsAppSmbHistoryEvent
  | IWhatsAppSmbMessageEchoesEvent
  | IWhatsAppSmbAppStateSyncEvent
  | IWhatsAppUserPreferencesEvent
