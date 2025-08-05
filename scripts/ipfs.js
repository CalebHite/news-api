import axios from 'axios';

export async function getDocumentsNearLocation(targetLocation) {
    if (!targetLocation || !targetLocation.latitude || !targetLocation.longitude) {
        throw new Error('Invalid targetLocation. It must include latitude and longitude.');
    }

    const url = `https://api.pinata.cloud/data/pinList?status=pinned`;

    const response = await axios.get(url, {
        headers: {
            'pinata_api_key': 'hidden',
            'pinata_secret_api_key': 'hidden'
        }
    });

    const documents = response.data.rows;

    // Filter nearby documents first
    const nearbyDocuments = documents.filter(doc => {
        const latitude = parseFloat(doc.metadata?.keyvalues?.latitude);
        const longitude = parseFloat(doc.metadata?.keyvalues?.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
            const distance = getDistanceFromLatLonInKm(
                targetLocation.latitude,
                targetLocation.longitude,
                latitude,
                longitude
            );
            return distance <= 50;
        }
        return false;
    });

    // Fetch actual IPFS content for nearby documents
    const documentsWithContent = await Promise.all(
        nearbyDocuments.map(async (doc) => {
            try {
                console.log("Fetching content for document:", doc.ipfs_pin_hash);
                const ipfsGatewayUrl = `https://gateway.pinata.cloud/ipfs/${doc.ipfs_pin_hash}`;
                const contentResponse = await axios.get(ipfsGatewayUrl);
                console.log("Content fetched successfully:", doc.ipfs_pin_hash);
                
                return {
                    ...doc,
                    content: contentResponse.data
                };
            } catch (error) {
                console.error(`Error fetching IPFS content for hash ${doc.ipfs_pin_hash}:`, error);
                return {
                    ...doc,
                    content: null,
                    error: 'Failed to fetch content'
                };
            }
        })
    );

    return documentsWithContent;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
