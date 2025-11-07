import { config } from '../config/config';
import { logger } from '../utils/logger';

export class FaceComparator {
    static calculateSimilarity(encoding1: Float32Array, encoding2: Float32Array): number {
        if (encoding1.length !== encoding2.length) {
            throw new Error('Encodings must have the same length');
        }
    
        let sumSquaredDiff = 0;
        for (let i = 0; i < encoding1.length; i++) {
            const diff = encoding1[i] - encoding2[i];
            sumSquaredDiff += diff * diff;
        }
        
        const distance = Math.sqrt(sumSquaredDiff);
        
        const similarity = Math.exp(-distance * 0.95);
        
        logger.debug('Face similarity calculation', {
            distance,
            similarity,
            threshold: config.similarityThreshold
        });
        
        return similarity;
    }

    static isSamePerson(similarity: number): boolean {
        const isSame = similarity >= config.similarityThreshold;
        
        logger.debug('Face comparison result', {
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
            _debug: {
                calculationMethod: 'exponential_decay',
                adjustmentFactor: 0.95
            }
        };
    }
}