import { GoogleGenerativeAI } from "@google/generative-ai";
import { Readable } from 'stream';

const genAI = new GoogleGenerativeAI("AIzaSyAJ19BKd_HmLWhWev3SzqZCoKRFq239eXg");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyzes different types of media content using OpenAI
 * @param {Object} content - The content to analyze
 * @param {string} mimeType - The MIME type of the content
 * @returns {Promise<string>} Analysis of the content
 */
async function analyzeContent(content, mimeType, metadata) {
    try {
        let analysis = '';

        // Handle different types of content
        if (mimeType.startsWith('image/')) {
            analysis = await analyzeImage(content);
        } else if (mimeType.startsWith('video/')) {
            analysis = await analyzeVideo(content);
        } else if (mimeType.startsWith('audio/')) {
            analysis = await analyzeAudio(content);
        } else if (mimeType === 'application/pdf') {
            analysis = await analyzeText(content);
        } else if (mimeType === 'application/json') {
            analysis = await analyzeText(JSON.stringify(content, null, 2));
        } else {
            analysis = await analyzeText(String(content));
        }

        return analysis;
    } catch (error) {
        console.error('Error analyzing content:', error);
        throw error;
    }
}

async function analyzeImage(imageData) {
    try {
        const response = await model.generateContent({
            prompt: "Please analyze this image and describe its key elements and significance.",
            image: `data:image/jpeg;base64,${imageData.toString('base64')}`
        });

        return response.text;
    } catch (error) {
        console.error('Error analyzing image:', error);
        return 'Error analyzing image content';
    }
}

async function analyzeAudio(audioData) {
    try {
        const transcription = await gemini.audio.transcribe({
            audio: createReadableStream(audioData)
        });

        return analyzeText(transcription.text);
    } catch (error) {
        console.error('Error analyzing audio:', error);
        return 'Error analyzing audio content';
    }
}

async function analyzeVideo(videoData) {
    // For video, we might want to analyze key frames and audio
    // This is a simplified version that treats it as a combination of image and audio
    try {
        // Note: In a real implementation, you'd want to extract key frames and audio
        return "Video content analysis placeholder - would analyze both visual and audio components";
    } catch (error) {
        console.error('Error analyzing video:', error);
        return 'Error analyzing video content';
    }
}

async function analyzeText(text) {
    try {
        // Ensure the prompt and context are strings
        const prompt = String(text);
        const context = "You are an expert analyst and writer. Analyze the content and provide key insights.";

        const response = await model.generateContent({
            prompt: prompt,
            context: context
        });

        return response.text;
    } catch (error) {
        console.error('Error analyzing text:', error);
        return 'Error analyzing text content';
    }
}

/**
 * Generates a comprehensive article from multiple IPFS documents
 * @param {Array} documents - Array of IPFS documents
 * @returns {Promise<Object>} Article and individual analyses
 */
export async function generateArticle(documents) {
    try {
        // First, analyze each document individually
        const analyzedDocs = await Promise.all(documents.map(async (doc) => {
            if (!doc.content || doc.error) {
                return {
                    ...doc,
                    analysis: 'No content available for analysis'
                };
            }

            try {
                const analysis = await analyzeContent(doc.content, doc.mime_type, doc.metadata);
                return {
                    ...doc,
                    analysis
                };
            } catch (error) {
                return {
                    ...doc,
                    analysis: 'Error analyzing content',
                    analysisError: error.message
                };
            }
        }));

        // Then, generate a comprehensive article from all analyses
        const analyses = analyzedDocs
            .map(doc => doc.analysis)
            .filter(analysis => analysis && !analysis.startsWith('Error'));

        const articlePrompt = `
            Based on the following analyses of different media and documents, 
            write a comprehensive article that tells the complete story. 
            Include relevant details from all sources while maintaining a 
            coherent narrative flow.

            Analyses:
            ${analyses.join('\n\n')}
        `;

        const articleResponse = await model.generateContent({
            prompt: articlePrompt,
            context: "You are a skilled journalist who writes engaging and informative articles. Focus on being unbiased and factual."
        });

        return {
            article: articleResponse.text,
            analyzedDocuments: analyzedDocs
        };
    } catch (error) {
        console.error('Error generating article:', error);
        throw error;
    }
}

// Utility function to create a readable stream from buffer
function createReadableStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}