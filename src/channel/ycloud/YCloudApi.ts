/**
 * YCloud API Client for sending WhatsApp messages
 * @see https://docs.ycloud.com/reference/send-whatsapp-message
 */
export class YCloudApi {
  private readonly baseUrl = 'https://api.ycloud.com/v2'

  constructor(private apiKey: string) {}

  /**
   * Send a WhatsApp text message
   * @param from - Business phone number (e.g., "1234567890")
   * @param to - Recipient phone number in E.164 format (e.g., "573001234567")
   * @param text - Text message content
   * @param options - Additional options like externalId for tracking
   * @returns Response containing message ID and status
   */
  async sendTextMessage(
    from: string,
    to: string,
    text: string,
    options?: IYCloudSendMessageOptions,
  ): Promise<IYCloudSendMessageResponse> {
    return this.sendMessage({
      from,
      to,
      type: 'text',
      text: {
        body: text,
      },
      ...options,
    })
  }

  /**
   * Send a WhatsApp message using the YCloud API
   * @param message - Message payload
   * @returns Response containing message ID and status
   */
  async sendMessage(message: IYCloudSendMessagePayload): Promise<IYCloudSendMessageResponse> {
    const response = await fetch(`${this.baseUrl}/whatsapp/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new YCloudApiError(
        `Failed to send WhatsApp message: ${response.status} ${response.statusText}`,
        response.status,
        errorBody,
      )
    }

    return response.json()
  }

  /**
   * Send a WhatsApp image message
   */
  async sendImageMessage(
    from: string,
    to: string,
    imageUrl: string,
    caption?: string,
    options?: IYCloudSendMessageOptions,
  ): Promise<IYCloudSendMessageResponse> {
    return this.sendMessage({
      from,
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption,
      },
      ...options,
    })
  }

  /**
   * Send a WhatsApp document message
   */
  async sendDocumentMessage(
    from: string,
    to: string,
    documentUrl: string,
    filename?: string,
    caption?: string,
    options?: IYCloudSendMessageOptions,
  ): Promise<IYCloudSendMessageResponse> {
    return this.sendMessage({
      from,
      to,
      type: 'document',
      document: {
        link: documentUrl,
        filename,
        caption,
      },
      ...options,
    })
  }

  /**
   * Send a WhatsApp video message
   */
  async sendVideoMessage(
    from: string,
    to: string,
    videoUrl: string,
    caption?: string,
    options?: IYCloudSendMessageOptions,
  ): Promise<IYCloudSendMessageResponse> {
    return this.sendMessage({
      from,
      to,
      type: 'video',
      video: {
        link: videoUrl,
        caption,
      },
      ...options,
    })
  }

  /**
   * Send a WhatsApp audio message
   */
  async sendAudioMessage(
    from: string,
    to: string,
    audioUrl: string,
    options?: IYCloudSendMessageOptions,
  ): Promise<IYCloudSendMessageResponse> {
    return this.sendMessage({
      from,
      to,
      type: 'audio',
      audio: {
        link: audioUrl,
      },
      ...options,
    })
  }

  /**
   * Send a WhatsApp location message
   */
  async sendLocationMessage(
    from: string,
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: IYCloudSendMessageOptions,
  ): Promise<IYCloudSendMessageResponse> {
    return this.sendMessage({
      from,
      to,
      type: 'location',
      location: {
        latitude,
        longitude,
        name,
        address,
      },
      ...options,
    })
  }
}

/**
 * Custom error class for YCloud API errors
 */
export class YCloudApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody: string,
  ) {
    super(message)
    this.name = 'YCloudApiError'
  }
}

// ========================================
// Request Types
// ========================================

export interface IYCloudSendMessageOptions {
  /** External ID for tracking purposes */
  externalId?: string
}

export interface IYCloudSendMessagePayload extends IYCloudSendMessageOptions {
  /** Business phone number ID or phone number */
  from: string
  /** Recipient phone number in E.164 format */
  to: string
  /** Message type */
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | 'template'
  /** Text message content */
  text?: {
    body: string
    previewUrl?: boolean
  }
  /** Image message content */
  image?: {
    link: string
    caption?: string
  }
  /** Video message content */
  video?: {
    link: string
    caption?: string
  }
  /** Audio message content */
  audio?: {
    link: string
  }
  /** Document message content */
  document?: {
    link: string
    filename?: string
    caption?: string
  }
  /** Location message content */
  location?: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
  /** Contacts message content */
  contacts?: IYCloudContactPayload[]
  /** Template message content */
  template?: {
    name: string
    language: {
      code: string
    }
    components?: IYCloudTemplateComponent[]
  }
}

export interface IYCloudContactPayload {
  name: {
    formatted_name: string
    first_name?: string
    last_name?: string
  }
  phones?: Array<{
    phone: string
    type?: string
  }>
  emails?: Array<{
    email: string
    type?: string
  }>
}

export interface IYCloudTemplateComponent {
  type: 'header' | 'body' | 'button'
  parameters?: IYCloudTemplateParameter[]
  sub_type?: string
  index?: number
}

export interface IYCloudTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video'
  text?: string
  currency?: {
    fallback_value: string
    code: string
    amount_1000: number
  }
  date_time?: {
    fallback_value: string
  }
  image?: {
    link: string
  }
  document?: {
    link: string
    filename?: string
  }
  video?: {
    link: string
  }
}

// ========================================
// Response Types
// ========================================

export interface IYCloudSendMessageResponse {
  /** Message ID */
  id: string
  /** WhatsApp message ID */
  wamid?: string
  /** WhatsApp Business Account ID */
  wabaId: string
  /** Business phone number */
  from: string
  /** Recipient phone number */
  to: string
  /** Message status */
  status: 'accepted' | 'sent' | 'delivered' | 'read' | 'failed'
  /** Message type */
  type: string
  /** External ID if provided */
  externalId?: string
  /** Creation timestamp */
  createTime: string
  /** Total price if applicable */
  totalPrice?: string
  /** Currency if applicable */
  currency?: string
  /** Error details if failed */
  errorCode?: string
  errorMessage?: string
}
