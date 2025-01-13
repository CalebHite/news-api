import axios from 'axios';

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

async function getDocumentsNearLocation(targetLocation) {
    const url = `https://api.pinata.cloud/data/pinList?status=pinned`;

    const response = await axios.get(url, {
        headers: {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey
        }
    });

    const documents = response.data.rows;
    const resolvedLocation = await targetLocation;
    const nearbyDocuments = documents.filter(doc => {
        const latitude = doc.metadata?.keyvalues?.latitude;
        const longitude = doc.metadata?.keyvalues?.longitude;
        if (location) {
            const distance = getDistanceFromLatLonInKm(
                resolvedLocation.latitude,
                resolvedLocation.longitude,
                latitude,
                longitude
            );
            // constant is radius of search around location
            return distance <= 50;
        }
        return false;
    });

    return nearbyDocuments;
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

export { getDocumentsNearLocation };