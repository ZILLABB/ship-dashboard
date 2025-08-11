// Multisig transaction handling service
// Based on your existing HandleMultisig implementation

export interface MultiSigTx {
  txId: string;
  unsignedTx: string;
  signers: string[];
  mininumSigner: number;
  entityDbName: string;
  entityId: string;
}

export interface MultiSigWitness {
  txId: string;
  signedTx: string;
  signer: string;
}

// Simple in-memory storage for development
// In production, this would use your actual PendingTxWitnessesDB
class PendingTxWitnessesDB {
  private witnesses: { [key: string]: MultiSigWitness } = {};
  private idCounter = 0;

  async addEntry(witness: MultiSigWitness): Promise<string> {
    const id = `witness_${++this.idCounter}`;
    this.witnesses[id] = witness;
    return id;
  }

  async queryAllEntries(): Promise<{ [key: string]: MultiSigWitness }> {
    return this.witnesses;
  }
}

// Submit transaction function
async function submitTransaction(unsignedTx: string, witnesses: string[]): Promise<any> {
  // This would call your actual transaction submission service
  console.log('Submitting transaction with witnesses:', { unsignedTx, witnesses });

  // For now, simulate submission
  return {
    txId: `submitted_${Date.now()}`,
    success: true
  };
}

export class HandleMultisig {
  private readonly db: PendingTxWitnessesDB = new PendingTxWitnessesDB();
  private witnesses: MultiSigWitness[] = [];

  constructor(private tx: MultiSigTx, private walletName: string) { }

  // Sign and submit the transaction
  private async signTxx(unsignedTx: string): Promise<any> {
    if (typeof window === 'undefined' || !(window as any).cardano) {
      throw new Error('Cardano wallet not available');
    }

    const ap = await (window as any).cardano[this.walletName].enable();
    const signedTx = await ap.signTx(unsignedTx, true);
    return signedTx;
  }

  public async addWitness(signer: string): Promise<any> {
    if (
      this.tx.signers.includes(signer) &&
      !(await this.signedByWitness(signer))
    ) {
      const signedTx = await this.signTxx(this.tx.unsignedTx);
      const multiSigWitness: MultiSigWitness = {
        txId: this.tx.txId,
        signedTx: signedTx,
        signer: signer,
      };

      const witnessId = await this.db.addEntry(multiSigWitness);
      console.log("multiSigTx Hash", `ipfs://${witnessId}`);
      await this.submitMultiSigTx();
    } else {
      console.log("Signer not in signers list");
    }
    return this;
  }

  public async getWitnesses(): Promise<MultiSigWitness[]> {
    if (this.witnesses.length === 0) {
      const allWitnesses = await this.db.queryAllEntries();
      this.witnesses = Object.values(allWitnesses).filter(
        (witness) => witness.txId === this.tx.txId
      );
    }
    return this.witnesses;
  }

  public async submitMultiSigTx() {
    const isSignedByAll = await this.signedByAllWitnesses();
    if (isSignedByAll) {
      const witnesses = await this.getWitnesses();
      const witnessSignatures = witnesses.map((witness) => witness.signedTx);
      return await submitTransaction(this.tx.unsignedTx, witnessSignatures);
    }
  }

  public async signedByWitness(signer: string): Promise<boolean> {
    const witnesses = await this.getWitnesses();
    return witnesses.some((witness) => witness.signer === signer);
  }

  public async signedByAllWitnesses(): Promise<boolean> {
    const witnesses = await this.getWitnesses();
    return this.tx.signers.every((signer) =>
      witnesses.map((w) => w.signer).includes(signer)
    ) || witnesses.length >= this.tx.mininumSigner;
  }
}

// Colony database simulation
export class ColonyDB {
  private colonies: { [key: string]: any } = {};
  private idCounter = 0;

  async addEntry(colony: any): Promise<string> {
    const id = `colony_${++this.idCounter}`;
    this.colonies[id] = colony;
    return id;
  }

  getDbName(): string {
    return 'colonies';
  }
}

export const colonyDb = new ColonyDB();
