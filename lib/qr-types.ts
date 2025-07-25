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
  {
    type: "vcard",
    label: "VCARD",
    icon: "[◄]",
    description: "Contact card",
    fields: [
      {
        name: "name",
        label: "Full Name",
        type: "text",
        placeholder: "John Doe",
        required: true,
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1234567890",
        required: false,
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "john@example.com",
        required: false,
      },
      {
        name: "organization",
        label: "Organization",
        type: "text",
        placeholder: "Company Name",
        required: false,
      },
      {
        name: "title",
        label: "Job Title",
        type: "text",
        placeholder: "Software Engineer",
        required: false,
      },
      {
        name: "website",
        label: "Website",
        type: "text",
        placeholder: "https://example.com",
        required: false,
      },
      {
        name: "address",
        label: "Address",
        type: "text",
        placeholder: "123 Main St, City, State",
        required: false,
      },
      {
        name: "notes",
        label: "Notes",
        type: "text",
        placeholder: "Additional information",
        required: false,
      },
    ],
  },
  {
    type: "crypto",
    label: "CRYPTO",
    icon: "[₿]",
    description: "Cryptocurrency address",
    fields: [
      {
        name: "currency",
        label: "Currency",
        type: "select",
        required: true,
        options: [
          { value: "bitcoin", label: "Bitcoin (BTC)" },
          { value: "ethereum", label: "Ethereum (ETH)" },
          { value: "litecoin", label: "Litecoin (LTC)" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "address",
        label: "Wallet Address",
        type: "text",
        placeholder: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        required: true,
      },
      {
        name: "amount",
        label: "Amount (optional)",
        type: "text",
        placeholder: "0.001",
        required: false,
      },
      {
        name: "label",
        label: "Label (optional)",
        type: "text",
        placeholder: "Payment for service",
        required: false,
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
    
    case "vcard":
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        data.name ? `FN:${data.name}` : "",
        data.name ? `N:${data.name.split(" ").reverse().join(";")}` : "",
        data.phone ? `TEL:${data.phone}` : "",
        data.email ? `EMAIL:${data.email}` : "",
        data.organization ? `ORG:${data.organization}` : "",
        data.title ? `TITLE:${data.title}` : "",
        data.website ? `URL:${data.website}` : "",
        data.address ? `ADR:;;${data.address};;;` : "",
        data.notes ? `NOTE:${data.notes}` : "",
        "END:VCARD"
      ].filter(line => line !== "").join("\n");
      return vcard;
    
    case "crypto":
      // Format depends on currency type
      const currency = data.currency || "bitcoin";
      const address = data.address || "";
      const amount = data.amount;
      const label = data.label;
      
      if (currency === "bitcoin") {
        let uri = `bitcoin:${address}`;
        const params = [];
        if (amount) params.push(`amount=${amount}`);
        if (label) params.push(`label=${encodeURIComponent(label)}`);
        if (params.length > 0) uri += `?${params.join("&")}`;
        return uri;
      } else if (currency === "ethereum") {
        let uri = `ethereum:${address}`;
        const params = [];
        if (amount) params.push(`value=${amount}`);
        if (label) params.push(`label=${encodeURIComponent(label)}`);
        if (params.length > 0) uri += `?${params.join("&")}`;
        return uri;
      } else {
        // Generic format for other currencies
        return `${currency}:${address}${amount ? `?amount=${amount}` : ""}`;
      }
    
    default:
      return "";
  }
}