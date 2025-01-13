import axios from 'axios';

export async function getDocumentsNearLocation(targetLocation) {
    if (!targetLocation || !targetLocation.latitude || !targetLocation.longitude) {
        throw new Error('Invalid targetLocation. It must include latitude and longitude.');
    }

    const url = `https://api.pinata.cloud/data/pinList?status=pinned`;

    const response = await axios.get(url, {
        headers: {
            'pinata_api_key': '22d7e9243fc653a7e48c',
            'pinata_secret_api_key': 'f18cbf50244aad7ba931bf0a0421c8ec53ca0fd8465ad8d29d2647c10d8570c9'
        }
    });

    const documents = response.data.rows;

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
