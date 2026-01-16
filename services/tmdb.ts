const API_KEY = process.env.EXPO_PUBLIC_TMDB_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

//Helper function to fetch data
const apiCall = async (endpoint: string, params: string = '') => {
    const url = `${BASE_URL}/${endpoint}?api_key=${API_KEY}&language=en-US${params}`;
    try {
        const response = await fetch(url);
        return await response.json();
    }catch (error) {
        console.error('API ERROR:', error);
        return null;
    }
};

// Gets Trending Movies/TV (This acts as your 'News')
export const fetchTrending = async (page: number = 1) => {
    // Fetches Items Trending Today
    return await apiCall('trending/all/day', `&page=${page}`);
};

// Allows the user to search for anything
export const searchMulti = async (query: string) => {
    if (!query) return null;
    // Searchs for movies tv shows and people at the same time
    return await apiCall('search/multi', `&query=${encodeURIComponent(query)}&include_adult=false`);
};

// Builds the image cause TMDB only gives us the file names
export const getImageUrl = (path: string | null, size: string = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750.png?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};