export type StitchPassType = 'savingsGoal' | 'debtMilestone' | 'emergencyFund' | 'generic';

export interface StitchPassClass {
  id: string;
  issuerId: string;
  type: StitchPassType;
  reviewStatus?: string;
}

export interface StitchPassObject {
  id: string;
  classId: string;
  type?: StitchPassType;
  state?: string;
  heroImage?: string;
  barcode?: {
    type: string;
    value: string;
  };
  textModulesData?: {
    header: string;
    body: string;
  }[];
  linksModuleData?: {
    uris?: {
      uri: string;
      description: string;
    }[];
  };
  imageModulesData?: {
    mainImage?: {
      sourceUri: {
        uri: string;
      };
    };
  }[];
}

export interface StitchJwtResponse {
  jwt: string;
}

export interface StitchSaveResponse {
  success: boolean;
  message?: string;
}

export interface FinPathPassPayload {
  type: StitchPassType;
  title: string;
  subtitle: string;
  value: string;
  details: {
    label: string;
    value: string;
  }[];
  barcodeValue?: string;
}

export interface StitchServiceConfig {
  issuerId: string;
  originJwt?: string;
  apiKey?: string;
  mcpServerUrl?: string;
}
