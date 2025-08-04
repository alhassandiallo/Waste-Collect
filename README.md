# 🗑️ Smart Waste Collection and Management Network

![Java](https://img.shields.io/badge/Java-17-007396.svg?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F.svg?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1.svg?style=for-the-badge&logo=mysql)
![Maven](https://img.shields.io/badge/Maven-Apache_3.8.6-C71A36.svg?style=for-the-badge&logo=apache-maven)

> One of the most crucial things in your open-source project is the README.md file. 

## 📌 Project Description

The Smart Waste Collection and Management Network is an intelligent platform designed to optimize waste collection services through digital connectivity between households, waste collectors, municipalities, and administrators. This enterprise application streamlines waste management operations, improves service quality, and provides data-driven insights for better decision-making.

Documentation serves as a reference guide for developers, providing insights into architecture, APIs, workflows, and best practices. 

## 💡 Key Features

### 👤 For Administrators
- Full system management and configuration
- Creation of municipalities and municipal managers
- Management of all users (collectors, households, municipal managers)
- Dispute resolution system
- Security configuration and monitoring
- Comprehensive reporting and analytics
- Real-time tracking system

### 🚛 For Collectors
- Real-time service request visualization
- Optimized collection route planning
- Daily performance metrics tracking
- Mobile payment integration
- Waste volume recording
- Customer feedback system
- Safety alerts and weather warnings
- Performance tracking with service ratings

### 🏠 For Households
- Waste collection scheduling
- Service quality rating system
- Waste generation pattern monitoring
- Collection preferences configuration
- Push notifications for collection times
- Digital payment processing
- Waste sorting educational content
- Illegal dumping reporting

### 🏢 For Municipalities
- Collection and waste volume tracking
- Identification of underserved areas
- Individual and global metrics analysis
- Interactive waste collection maps
- Predictive analytics for resource allocation
- Automated reporting on waste volumes
- Community engagement metrics

## 🛠️ Technologies Used

### Backend
- **Java 17** - Core programming language
- **Spring Boot 3.x** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database access
- **Hibernate** - ORM implementation
- **MySQL** - Relational database
- **Maven** - Build and dependency management

### Frontend
- **React 18.x** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Bootstrap 5** - Responsive UI components
- **Chart.js** - Data visualization

## 🗂️ Project Structure

```
wastecollect/
├── pom.xml                                 # POM parent du projet (type: pom)
├── common                                  # Module Common (type: jar)
│   ├── pom.xml
│   └── src
│       └── main
│           └── java
│               └── com
│                   └── wastecollect
│                       └── common
│                           ├── models      # Entités JPA partagées
│                           ├── dto         # Objets de transfert de données partagés
│                           └── utils       # Utilitaires partagés (enums, constantes)
│
└── webparent                               # Module parent des applications web (type: pom)
├── pom.xml
├── backend                             # Module Backend (Spring Boot Application) (type: jar)
│   ├── pom.xml
│   └── src
│       ├── main
│       │   ├── java
│       │   │   └── com
│       │   │       └── wastecollect
│       │   │           ├── WasteCollectBackendApplication.java
│       │   │           ├── config      # Configurations Spring
│       │   │           ├── controller  # Contrôleurs REST
│       │   │           ├── exceptions  # Classes d'exceptions personnalisées
│       │   │           ├── repository  # Interfaces de dépôt
│       │   │           ├── service     # Logique métier
│       │   │           └── security    # Classes liées à la sécurité
│       │   └── resources
│       │       ├── application.properties
│       │       ├── db                  # Scripts de base de données
│       │       └── static              # Fichiers statiques
│       └── test                        # Tests unitaires et d'intégration
│
└── frontend                            # Module Frontend (React.js Application)
├── pom.xml
└── src
    └── main
        └── frontend
            ├── public
            ├── src
            │   ├── index.js
            │   ├── App.js
            │   ├── components      # Composants réutilisables
            │   ├── pages           # Pages/Vues par rôle
            │   ├── services        # Fonctions pour les appels API
            │   ├── contexts        # Contextes React pour la gestion d'état
            │   ├── hooks           # Hooks personnalisés
            │   ├── assets          # Images, icônes
            │   ├── styles          # Fichiers CSS/SCSS
            │   └── utils           # Utilitaires frontend
            ├── package.json
            └── .env
```

Learn how to write a convincing and effective README file with proper structure and examples. 

## ⚙️ Installation & Setup

### Prerequisites
- Java 17+
- Maven 3.8.6+
- Node.js 18.x+
- MySQL 8.x

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/alhassandiallo/Waste-Collect.git
   cd Waste-Collect
   ```

2. Configure the database:
   - Create a MySQL database named `wastecollect`
   - Update `backend/src/main/resources/application.properties` with your database credentials

3. Build and run the application:
   ```bash
   mvn clean install
   mvn --projects backend spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/src/main/frontend
   ```

2. Install dependencies and start the application:
   ```bash
   npm install
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🧪 Testing

### Backend Tests
```bash
mvn --projects backend test
```

### Frontend Tests
```bash
cd frontend/src/main/frontend
npm test
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📚 Additional Resources

- [API Documentation](http://localhost:8080/swagger-ui.html) - Available when the backend is running
- [Project Wiki](https://github.com/alhassandiallo/Waste-Collect/wiki) - Detailed technical documentation

---

**Smart Waste Collection and Management Network** - Transforming waste management through digital innovation 🌍♻️
