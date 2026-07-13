import {
  StitchServiceConfig,
  StitchPassClass,
  StitchPassObject,
  StitchJwtResponse,
  StitchPassType,
} from './types';

const WALLET_API_BASE = 'https://walletobjects.googleapis.com/walletobjects/v1';

function getBearerToken(config: StitchServiceConfig): string {
  if (!config.originJwt) {
    throw new Error('Missing Stitch origin JWT (service account token).');
  }
  return config.originJwt;
}

function headers(config: StitchServiceConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${getBearerToken(config)}`,
    'Content-Type': 'application/json',
  };
}

export class StitchClient {
  private config: StitchServiceConfig;

  constructor(config: StitchServiceConfig) {
    this.config = config;
  }

  private getClassResource(type: StitchPassType): string {
    switch (type) {
      case 'savingsGoal':
      case 'debtMilestone':
      case 'emergencyFund':
      case 'generic':
      default:
        return 'genericClass';
    }
  }

  private getObjectResource(type: StitchPassType): string {
    switch (type) {
      case 'savingsGoal':
      case 'debtMilestone':
      case 'emergencyFund':
      case 'generic':
      default:
        return 'genericObject';
    }
  }

  async createPassClass(passClass: StitchPassClass): Promise<StitchPassClass> {
    const resource = this.getClassResource(passClass.type);
    const url = `${WALLET_API_BASE}/${resource}?issuerId=${this.config.issuerId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers(this.config),
      body: JSON.stringify(passClass),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create pass class: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getPassClass(type: StitchPassType, classId: string): Promise<StitchPassClass> {
    const resource = this.getClassResource(type);
    const url = `${WALLET_API_BASE}/${resource}/${this.config.issuerId}.${classId}`;

    const response = await fetch(url, {
      headers: headers(this.config),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get pass class: ${response.status} ${text}`);
    }

    return response.json();
  }

  async createPassObject(passObject: StitchPassObject & { type?: StitchPassType }): Promise<StitchPassObject> {
    const type = passObject.type || 'generic';
    const resource = this.getObjectResource(type);
    const url = `${WALLET_API_BASE}/${resource}?issuerId=${this.config.issuerId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers(this.config),
      body: JSON.stringify(passObject),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create pass object: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getPassJwt(type: StitchPassType, objectId: string): Promise<StitchJwtResponse> {
    const resource = this.getObjectResource(type);
    const url = `${WALLET_API_BASE}/${resource}/${this.config.issuerId}.${objectId}/jwt`;

    const response = await fetch(url, {
      headers: headers(this.config),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get pass JWT: ${response.status} ${text}`);
    }

    return response.json();
  }

  async savePassToWallet(jwt: string): Promise<{ success: boolean; url?: string }> {
    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;
    return {
      success: true,
      url: saveUrl,
    };
  }

  async createPassJwtForFinPath(
    type: StitchPassType,
    classId: string,
    objectId: string,
    payload: Record<string, any>
  ): Promise<StitchJwtResponse> {
    const resource = this.getObjectResource(type);
    const url = `${WALLET_API_BASE}/${resource}/${this.config.issuerId}.${objectId}/jwt`;

    const response = await fetch(url, {
      method: 'POST',
      headers: headers(this.config),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create pass JWT: ${response.status} ${text}`);
    }

    return response.json();
  }
}

export function createStitchClient(config: StitchServiceConfig): StitchClient {
  return new StitchClient(config);
}
