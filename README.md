# OwnTracks Modern Frontend

A modern, Google Maps-inspired web interface for [OwnTracks](https://owntracks.org/) location tracking. Built with React, TypeScript, TailwindCSS, and Leaflet for displaying your location history with an intuitive and beautiful user interface.

## Features

- 🗺️ **Interactive Map** - OpenStreetMap-based visualization with smooth interactions
- 📱 **Device Management** - Easy selection between multiple tracked devices
- 📅 **Flexible Date Filtering** - Quick presets (12h, 24h, 7d, 30d) or custom date ranges
- 📍 **Dual Display Modes**:
  - **Points Mode** - Individual location markers with detailed popups
  - **Track Mode** - Continuous path visualization with start/end markers
- 🎨 **Modern UI** - Google Maps-inspired floating controls with smooth animations
- ⚡ **Real-time Updates** - Refresh button to fetch latest location data
- 📊 **Location Details** - Battery level, velocity, altitude, and reverse geocoding
- 🐳 **Docker Ready** - Easy deployment with Nginx

## Screenshots

The interface features:
- Floating control panel on the left with device selector, date range picker, and display mode toggle
- Full-screen map view powered by OpenStreetMap
- Location info panel showing detailed point information when clicked
- Clean, modern design with smooth hover effects and transitions

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS 3
- **Mapping**: Leaflet + React-Leaflet
- **Build Tool**: Vite 5
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Container**: Docker with Nginx

## Prerequisites

- Node.js 18+ (for local development) or Bun
- Docker & Docker Compose (for containerized deployment)
- OwnTracks Recorder instance running and accessible

## Quick Start

### Local Development

1. **Clone and install dependencies**:
```bash
npm install / bun install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your OwnTracks Recorder URL
```

3. **Run development server**:
```bash
npm run dev / bun run dev
```

The app will be available at `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**:
```bash
docker-compose up -d
```

2. **Access the frontend**:
```
http://localhost:3000
```

### Standalone Docker Build

```bash
# Build the image
docker build -t owntracks-modern-frontend .

# Run the container
docker run -d \
  -p 3000:80 \
  -e PROXY_TARGET=http://your-recorder:8083 \
  --name owntracks-frontend \
  owntracks-modern-frontend
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_URL=/api/0
VITE_PROXY_TARGET=http://your-recorder:8083
VITE_API_USERNAME=your-username  # Optional
VITE_API_PASSWORD=your-password  # Optional
```

### Nginx Configuration

The `nginx.conf` file handles:
- API proxy to OwnTracks Recorder
- Static asset caching
- SPA routing
- CORS headers (if needed)
- Gzip compression

**Important**: Update the `proxy_pass` in `nginx.conf` or set the `API_URL` environment variable to point to your OwnTracks Recorder instance.

## Integration with OwnTracks Recorder

### Recorder Setup

Ensure your OwnTracks Recorder is running in HTTP mode. Example Docker Compose:

```yaml
services:
  owntracks-recorder:
    image: owntracks/recorder
    ports:
      - "8083:8083"
    environment:
      - OTR_PORT=0  # Disable MQTT, use HTTP only
    volumes:
      - ./recorder-data/config:/config
      - ./recorder-data/store:/store
```

## API Endpoints Used

The frontend interacts with these OwnTracks Recorder API endpoints:

- `GET /api/0/last` - Fetch last known positions for all devices
- `GET /api/0/last?user={user}&device={device}` - Fetch last position for specific device
- `GET /api/0/locations?user={user}&device={device}&from={date}&to={date}&format={format}` - Fetch location history

Supported formats: `json`, `geojson`, `linestring`

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding Features

The modular component structure makes it easy to extend:

1. **Add new filters**: Create components in `src/components/`
2. **Extend API**: Add methods to `src/api.ts`
3. **New map features**: Modify `src/components/MapView.tsx`
4. **Styling**: Use TailwindCSS utility classes

## Deployment Considerations

### Production Build

The production build is optimized with:
- Code splitting
- Minification
- Tree shaking
- Asset optimization

### Security

- Always use HTTPS in production
- Implement authentication on the OwnTracks Recorder
- Use environment variables for sensitive data
- Configure CORS appropriately

### Reverse Proxy

Recommended setup with authentication:

```nginx
server {
    listen 443 ssl;
    server_name owntracks.yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Basic auth (optional)
    auth_basic "OwnTracks";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api/ {
        proxy_pass http://recorder:8083/api/;
    }
}
```

## Troubleshooting

### No devices showing up

1. Check if OwnTracks Recorder is running and accessible
2. Verify API URL in environment variables
3. Check browser console for CORS errors
4. Ensure devices have published at least one location

### Map not displaying

1. Verify internet connection (OpenStreetMap tiles)
2. Check browser console for JavaScript errors
3. Ensure Leaflet CSS is loaded correctly

### API authentication issues

1. Verify credentials in `.env` file
2. Check if Recorder requires authentication
3. Inspect network tab for 401/403 errors

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [OwnTracks](https://owntracks.org/) - The self-hosted location tracking platform
- [Leaflet](https://leafletjs.com/) - Mobile-friendly interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data provider
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

## Support

For issues and questions:
- Check the [OwnTracks documentation](https://owntracks.org/booklet/)
- Review existing GitHub issues
- Create a new issue with detailed information

---

**Note**: This is a third-party frontend for OwnTracks and is not officially affiliated with the OwnTracks project.
