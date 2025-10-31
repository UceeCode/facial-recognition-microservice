import { config } from '../config/config';
import { logger } from '../utils/logger';


export class FaceComparator {
    static calculateSimilarity(encoding1: Float32Array, encoding2: Float32Array): number {
        if (encoding1.length !== encoding2.length) {
            throw new Error('Encodings must have the same length');
        }
    
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
    
        for (let i = 0; i < encoding1.length; i++) {
          dotProduct += encoding1[i] * encoding2[i];
          norm1 += encoding1[i] * encoding1[i];
          norm2 += encoding2[i] * encoding2[i];
        }
    
        const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
        
        return Math.max(0, Math.min(1, similarity));
    }


    static isSamePerson(similarity: number): boolean {
        const isSame = similarity >= config.similarityThreshold;
        
        logger.debug('Face comparison', {
            similarity,
            threshold: config.similarityThreshold,
            isSamePerson: isSame,
        });
    
        return isSame;
    }

    static compare(encoding1: Float32Array, encoding2: Float32Array) {
        const similarity = this.calculateSimilarity(encoding1, encoding2);
        const isSamePerson = this.isSamePerson(similarity);
    
        return {
            similarity: parseFloat(similarity.toFixed(4)),
            isSamePerson,
        };
    }
}