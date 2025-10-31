export interface EncodingRequest {
    image: Express.Multer.File;
}

export interface ComparisonRequest {
    image1: Express.Multer.File;
    image2: Express.Multer.File;
}

export interface EncodingResponse {
    success: boolean;
    encoding?: number[];
    error?: string;
}

export interface ComparisonResponse {
    success: boolean;
    similarity?: number;
    isSamePerson?: boolean;
    error?: string;
}