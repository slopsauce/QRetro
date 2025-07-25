export type QRDataType = 
  | "text"
  | "url"
  | "wifi"
  | "email"
  | "sms"
  | "phone"
  | "vcard"
  | "crypto";

export interface QRTypeConfig {
  type: QRDataType;
  label: string;
  icon: string;
  description: string;
  fields: QRField[];
}

export interface QRField {
  name: string;
  label: string;
  type: "text" | "select" | "email" | "tel" | "password";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export const QR_TYPES: QRTypeConfig[] = [
  {
    type: "text",
    label: "TEXT",
    icon: "[-]",
    description: "Plain text or message",
    fields: [
      {
        name: "text",
        label: "Text",
        type: "text",
        placeholder: "Enter your text here...",
        required: true,
      },
    ],
  },
  {
    type: "url",
    label: "URL",
    icon: "[◊]",
    description: "Website or link",
    fields: [
      {
        name: "url",
        label: "URL",
        type: "text",
        placeholder: "https://example.com",
        required: true,
      },
    ],
  },
  {
    type: "wifi",
    label: "WIFI",
    icon: "[≈]",
    description: "WiFi network credentials",
    fields: [
      {
        name: "ssid",
        label: "Network Name (SSID)",
        type: "text",
        placeholder: "MyWiFiNetwork",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        required: false,
      },
      {
        name: "security",
        label: "Security",
        type: "select",
        required: true,
        options: [
          { value: "WPA", label: "WPA/WPA2" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "None" },
        ],
      },
    ],
  },
  {
    type: "email",
    label: "EMAIL",
    icon: "[@]",
    description: "Email address",
    fields: [
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "user@example.com",
        required: true,
      },
      {
        name: "subject",
        label: "Subject",
        type: "text",
        placeholder: "Optional subject",
        required: false,
      },
      {
        name: "body",
        label: "Message",
        type: "text",
        placeholder: "Optional message",
        required: false,
      },
    ],
  },
  {
    type: "sms",
    label: "SMS",
    icon: "[»]",
    description: "Text message",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1234567890",
        required: true,
      },
      {
        name: "message",
        label: "Message",
        type: "text",
        placeholder: "Your message here",
        required: false,
      },
    ],
  },
  {
    type: "phone",
    label: "PHONE",
    icon: "[#]",
    description: "Phone number",
    fields: [
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1234567890",
        required: true,
      },
    ],
  },
];

export function generateQRData(type: QRDataType, data: Record<string, string>): string {
  switch (type) {
    case "text":
      return data.text || "";
    
    case "url":
      return data.url || "";
    
    case "wifi":
      const security = data.security === "nopass" ? "" : data.security;
      const password = data.password ? `P:${data.password};` : "";
      return `WIFI:T:${security};S:${data.ssid};${password};`;
    
    case "email":
      let mailto = `mailto:${data.email}`;
      const params = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      if (params.length > 0) mailto += `?${params.join("&")}`;
      return mailto;
    
    case "sms":
      return `sms:${data.phone}${data.message ? `?body=${encodeURIComponent(data.message)}` : ""}`;
    
    case "phone":
      return `tel:${data.phone}`;
    
    default:
      return "";
  }
}