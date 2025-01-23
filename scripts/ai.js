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
        // Clean and prepare the text content
        let cleanText = '';
        
        if (typeof text === 'string') {
            cleanText = text;
        } else if (text instanceof Buffer) {
            cleanText = text.toString('utf-8');
        } else {
            cleanText = JSON.stringify(text, null, 2);
        }

        // Create a more specific prompt for better analysis
        const prompt = {
            contents: [{
                parts: [{
                    text: `As an expert analyst, please analyze the following content and provide key insights. Focus on the main points and important details: ${cleanText}`
                }]
            }]
        };

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Log the analysis result for debugging
        console.log("Analysis result:", response.text());
        
        return response.text();
    } catch (error) {
        console.error('Error in analyzeText:', error);
        // Return a more specific error message
        return `Error analyzing text content: ${error.message}`;
    }
}

/**
 * Generates a comprehensive article from multiple IPFS documents
 * @param {Array} documents - Array of IPFS documents
    * @returns {Promise<string>} The generated article
 */
export async function generateArticle(documents) {
    try {
        if (!Array.isArray(documents) || documents.length === 0) {
            throw new Error("No documents provided");
        }

        console.log("Received documents:", documents); // Debug log

        // First, analyze each document individually
        const analyzedDocs = await Promise.all(
            documents.map(async (doc) => {
                console.log("Processing document:", doc); // Debug log
                
                if (!doc.content || doc.error) {
                    console.log("Skipping document - no content or has error:", doc.ipfs_pin_hash);
                    return {
                        ...doc,
                        analysis: 'No content available for analysis'
                    };
                }

                try {
                    const analysis = await analyzeContent(doc.content, doc.mime_type, doc.metadata);
                    console.log("Analysis completed for document:", doc.ipfs_pin_hash); // Debug log
                    return {
                        ...doc,
                        analysis
                    };
                } catch (error) {
                    console.error("Analysis failed for document:", doc.ipfs_pin_hash, error);
                    return {
                        ...doc,
                        analysis: 'Error analyzing content',
                        analysisError: error.message
                    };
                }
            })
        );

        const analyses = analyzedDocs
            .map(doc => doc.analysis)
            .filter(analysis => {
                console.log("Checking analysis:", analysis); // Debug log
                return analysis && 
                       typeof analysis === 'string' && 
                       analysis.length > 0 && 
                       !analysis.startsWith('Error analyzing');
            });

        console.log("Valid analyses:", analyses.length); // Debug log

        if (analyses.length === 0) {
            throw new Error("No valid analyses to generate an article from. Check if documents contain valid content.");
        }

        const articlePrompt = `
            Based on the following analyses of different media and documents, 
            write a comprehensive article that tells the complete story. 
            Include relevant details from all sources while maintaining a 
            coherent narrative flow.

            Analyses:
            ${analyses.join('\n\n')}
        `;

        const articleContext = `You are a skilled journalist who writes engaging and informative articles. Focus on being unbiased and factual.
        You are writing an article about the following topic: ${articlePrompt}`;

        const articleResponse = await model.generateContent(articleContext);

        // Return only the article text
        return articleResponse.text; // Add .text to get the actual content
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