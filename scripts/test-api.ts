import fs from 'fs';
import path from 'path';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';

const API_URL = 'http://localhost:3000';

interface EncodingResponse {
    success: boolean;
    encoding?: number[];
    error?: string;
}

interface ComparisonResponse {
    success: boolean;
    distance?: number;
    similarityPercentage?: number;
    isSamePerson?: boolean;
    error?: string;
}

interface ErrorResponse {
    success: false;
    error: string;
}

interface TestResult {
    testCase: string;
    status: 'PASS' | 'FAIL' | 'ERROR';
    expected: string;
    actual: string;
    details?: any;
}

class APITester {
    private results: TestResult[] = [];

async testEncode(imagePath: string, shouldPass: boolean, testName: string): Promise<void> {
    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        const response: AxiosResponse<EncodingResponse> = await axios.post(
            `${API_URL}/encode`, 
            formData, 
            {
            headers: formData.getHeaders(),
            timeout: 1000000,
            }
        );

        const passed = shouldPass && response.data.success;
        
        this.results.push({
            testCase: `ENCODE: ${testName}`,
            status: passed ? 'PASS' : 'FAIL',
            expected: shouldPass ? 'Success with encoding' : 'Should fail',
            actual: response.data.success 
            ? `Success (${response.data.encoding?.length || 0} values)` 
            : 'Failure',
            details: {
            success: response.data.success,
            encodingLength: response.data.encoding?.length,
            },
        });
        } catch (error: any) {
        const failed = !shouldPass;
        const errorData = error.response?.data as ErrorResponse | undefined;
        
        this.results.push({
            testCase: `ENCODE: ${testName}`,
            status: failed ? 'PASS' : 'ERROR',
            expected: shouldPass ? 'Success' : 'Expected failure',
            actual: errorData?.error || error.message,
            details: errorData,
        });
    }
}

async testCompare(
    image1Path: string,
    image2Path: string,
    shouldMatch: boolean,
    testName: string
): Promise<void> {
    try {
        const formData = new FormData();
        formData.append('image1', fs.createReadStream(image1Path));
        formData.append('image2', fs.createReadStream(image2Path));

        const response: AxiosResponse<ComparisonResponse> = await axios.post(
            `${API_URL}/compare`, 
            formData, 
            {
            headers: formData.getHeaders(),
            timeout: 1000000,
            }
        );

        const matchResult = response.data.isSamePerson || false;
        const passed = matchResult === shouldMatch;
        
        this.results.push({
            testCase: `COMPARE: ${testName}`,
            status: passed ? 'PASS' : 'FAIL',
            expected: shouldMatch 
            ? 'Same Person (distance < 0.6)' 
            : 'Different Person (distance >= 0.6)',
            actual: matchResult ? 'Same Person' : 'Different Person',
            details: {
            distance: response.data.distance,
            similarityPercentage: response.data.similarityPercentage,
            threshold: 0.6,
            },
        });
        } catch (error: any) {
        const errorData = error.response?.data as ErrorResponse | undefined;
        
        this.results.push({
            testCase: `COMPARE: ${testName}`,
            status: 'ERROR',
            expected: shouldMatch ? 'Same Person' : 'Different Person',
            actual: errorData?.error || error.message,
            details: errorData,
        });
        }
    }

    printResults(): void {
        console.log('\n' + '='.repeat(80));
        console.log('TEST RESULTS SUMMARY');
        console.log('='.repeat(80) + '\n');

        let passed = 0;
        let failed = 0;
        let errors = 0;

        this.results.forEach((result) => {
        const icon = result.status === 'PASS' ? '✓' : '✗';
        const color = result.status === 'PASS' 
            ? '\x1b[32m' 
            : result.status === 'FAIL' 
            ? '\x1b[31m' 
            : '\x1b[33m';
        
        console.log(`${color}${icon}\x1b[0m ${result.testCase}`);
        console.log(`  Expected: ${result.expected}`);
        console.log(`  Actual: ${result.actual}`);
        
        if (result.details?.distance !== undefined) {
            console.log(`  Distance: ${result.details.distance} | Similarity: ${result.details.similarityPercentage}%`);
        }
        
        if (result.status === 'PASS') passed++;
        else if (result.status === 'FAIL') failed++;
        else errors++;
        
        console.log('');
        });

        console.log('='.repeat(80));
        const successRate = this.results.length > 0 
        ? ((passed / this.results.length) * 100).toFixed(1)
        : '0.0';
        console.log(`Total: ${this.results.length} | Passed: ${passed} (${successRate}%) | Failed: ${failed} | Errors: ${errors}`);
        console.log('='.repeat(80) + '\n');
    }
}

async function runTests() {
    const tester = new APITester();
    const testCasesDir = path.join(__dirname, '../test-cases');

    console.log('Starting Face Recognition API Tests...\n');

    try {
        await axios.get(`${API_URL}/health`, { timeout: 5000 });
        console.log('✓ API is running\n');
    } catch (error) {
        console.error('✗ API is not running. Please start the server first.');
        console.error('Run: docker-compose up\n');
        process.exit(1);
    }

    console.log('='.repeat(80));
    console.log('TESTING POSITIVE MATCHES (Same Person - Different Conditions)');
    console.log('='.repeat(80) + '\n');

    const positiveMatchesDir = path.join(testCasesDir, 'positive_matches');
    
    if (fs.existsSync(positiveMatchesDir)) {
        const testFolders = fs.readdirSync(positiveMatchesDir).filter(f => 
        fs.statSync(path.join(positiveMatchesDir, f)).isDirectory()
        );

        for (const folder of testFolders) {
        const folderPath = path.join(positiveMatchesDir, folder);
        const images = fs.readdirSync(folderPath).filter(f => 
            /\.(jpg|jpeg|png)$/i.test(f)
        );

        if (images.length >= 2) {
            const image1 = path.join(folderPath, images[0]);
            const image2 = path.join(folderPath, images[1]);
            await tester.testCompare(image1, image2, true, folder);
        }
        }
    } else {
        console.log('⚠ No positive_matches directory found');
        console.log(`  Create directory at: ${positiveMatchesDir}\n`);
    }

    console.log('='.repeat(80));
    console.log('TESTING NEGATIVE MATCHES (Different People)');
    console.log('='.repeat(80) + '\n');

    const negativeMatchesDir = path.join(testCasesDir, 'negative_matches');
    
    if (fs.existsSync(negativeMatchesDir)) {
        const testFolders = fs.readdirSync(negativeMatchesDir).filter(f => 
        fs.statSync(path.join(negativeMatchesDir, f)).isDirectory()
        );

        for (const folder of testFolders) {
        const folderPath = path.join(negativeMatchesDir, folder);
        const images = fs.readdirSync(folderPath).filter(f => 
            /\.(jpg|jpeg|png)$/i.test(f)
        );

        if (images.length >= 2) {
            const image1 = path.join(folderPath, images[0]);
            const image2 = path.join(folderPath, images[1]);
            await tester.testCompare(image1, image2, false, folder);
        }
        }
    } else {
        console.log('⚠ No negative_matches directory found');
        console.log(`  Create directory at: ${negativeMatchesDir}\n`);
    }

    console.log('='.repeat(80));
    console.log('TESTING ERROR CASES (Should Fail Gracefully)');
    console.log('='.repeat(80) + '\n');

    const errorCasesDir = path.join(testCasesDir, 'error_cases');
    
    if (fs.existsSync(errorCasesDir)) {
        const testFolders = fs.readdirSync(errorCasesDir).filter(f => 
        fs.statSync(path.join(errorCasesDir, f)).isDirectory()
        );

        for (const folder of testFolders) {
        const folderPath = path.join(errorCasesDir, folder);
        const images = fs.readdirSync(folderPath).filter(f => 
            /\.(jpg|jpeg|png)$/i.test(f)
        );

        for (const image of images.slice(0, 2)) {
            const imagePath = path.join(folderPath, image);
            await tester.testEncode(imagePath, false, `${folder}/${image}`);
        }
        }
    } else {
        console.log('⚠ No error_cases directory found');
        console.log(`  Create directory at: ${errorCasesDir}\n`);
    }

    console.log('='.repeat(80));
    console.log('TESTING VALID ENCODE (Should succeed)');
    console.log('='.repeat(80) + '\n');

    if (fs.existsSync(positiveMatchesDir)) {
        const testFolders = fs.readdirSync(positiveMatchesDir).filter(f => 
        fs.statSync(path.join(positiveMatchesDir, f)).isDirectory()
        );

        if (testFolders.length > 0) {
        const firstFolder = path.join(positiveMatchesDir, testFolders[0]);
        const images = fs.readdirSync(firstFolder).filter(f => 
            /\.(jpg|jpeg|png)$/i.test(f)
        );
        
        if (images.length > 0) {
            const imagePath = path.join(firstFolder, images[0]);
            await tester.testEncode(imagePath, true, `Valid image: ${testFolders[0]}/${images[0]}`);
        }
        }
    }

    tester.printResults();
}

runTests().catch((error) => {
    console.error('Test runner failed:', error.message);
    process.exit(1);
});