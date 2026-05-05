export type UserRole = "CLIENT" | "ARTIST" | "ADMIN";
export type BookingType = "FLASH" | "CUSTOM";
export type BookingStatus =
  | "PENDING"
  | "DEPOSIT_PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface SizeOption {
  id: string;
  label: string;
  price?: number | null;
  sortOrder: number;
}

export interface FlashDesign {
  id: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  available: boolean;
  basePrice?: number | null;
  sortOrder: number;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  location?: string | null;
  instagramHandle?: string | null;
  websiteUrl?: string | null;
  portfolioImages: string[];
  depositAmount: number;
  depositPercent?: number | null;
  googleCalendarConnected: boolean;
  allowFlash: boolean;
  allowCustom: boolean;
  customFields: CustomField[];
  sizeOptions: SizeOption[];
  flashDesigns: FlashDesign[];
}

export interface CustomField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  required: boolean;
  options?: string[];
}

export interface Booking {
  id: string;
  artistId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  bookingType: BookingType;
  flashDesignId?: string | null;
  flashDesign?: FlashDesign | null;
  referenceImages: string[];
  size: string;
  bodyPlacement: string;
  notes?: string | null;
  appointmentDate?: Date | null;
  depositAmount: number;
  depositPaid: boolean;
  totalAmount?: number | null;
  status: BookingStatus;
  createdAt: Date;
}

export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  bookingType: BookingType;
  flashDesignId?: string;
  referenceImages?: File[];
  size: string;
  bodyPlacement: string;
  notes?: string;
  customFieldValues?: Record<string, string>;
}
