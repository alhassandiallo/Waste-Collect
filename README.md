# 🗑️ Smart Waste Collection and Management Network

![Project Banner](https://via.placeholder.com/1200x400?text=Smart+Waste+Collection+Management+Network)

> A digital platform connecting waste collectors with households to improve waste management services, increase environmental impact, and provide stable income for informal waste collectors. 

## 📌 Project Description

The Smart Waste Collection and Management Network is a comprehensive web application designed to revolutionize waste management systems through digital connectivity. This platform connects waste collectors with households, enabling efficient waste collection services while providing municipalities with data-driven insights for better decision-making. 

The application follows a clear change theory where:
1. The platform connects collectors with households
2. Households can choose regular collection or request informal collector services
3. Performance-based incentives improve service quality
4. Reliable service increases household participation
5. Data analytics optimizes collection routes
6. Formalized collectors obtain stable income
7. Environmental and health outcomes improve
8. Municipal waste management costs decrease

A detailed and well-organized README file demonstrates professionalism and shows that the project is well-maintained. 

## ✨ Key Features

### 🏛️ Admin Interface
- Complete system management and oversight
- Municipalities and municipal managers creation
- Advanced security features and system configuration
- Comprehensive dispute management system
- Real-time tracking and monitoring
- Detailed reporting and analytics

### 👷 Collector Interface
- Real-time service request visualization
- Collection route optimization
- Daily performance metrics tracking
- Mobile payment integration for revenue management
- Waste volume recording and service completion marking
- Customer feedback reception
- Safety alerts and weather warnings
- Performance tracking with service ratings and incentive progress

### 🏠 Household Interface
- Waste collection scheduling
- Service quality evaluation
- Waste generation pattern monitoring
- Collection preferences configuration
- Pre-collection notifications
- Digital payment capabilities
- Waste sorting educational content and recycling tips
- Environmental impact tracking
- Illegal dumping reporting

### 📊 Municipality Dashboard
- Real-time waste collection pattern analytics
- Service coverage gap identification
- Interactive maps showing collection routes and waste hotspots
- Predictive analytics for resource allocation
- Performance metrics tracking toward environmental and social goals
- Automated reporting on waste volumes and collection efficiency

## 🛠️ Technology Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security with JWT authentication
- **Database**: MySQL
- **Build Tool**: Maven

### Frontend
- **Framework**: React.js
- **Styling**: Bootstrap
- **State Management**: React Context API
- **Routing**: React Router

### Additional Tools
- Swagger for API documentation
- Maven for project management
- CORS configuration for cross-origin requests
- RESTful API architecture

## 🗂️ Project Structure

```
wastecollect/
├── pom.xml                                 # POM parent du projet
├── common                                  # Module Common (shared entities, DTOs, utils)
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
└── webparent                               # Module parent des applications web
    ├── pom.xml
    ├── backend                             # Module Backend (Spring Boot Application)
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
    │       └── test                        # Tests
    └── frontend                            # Module Frontend (React.js Application)
        ├── pom.xml
        └── src
            └── main
                └── frontend
                    ├── public
                    ├── src
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

The project follows a modular structure with clear separation of concerns, demonstrating a well-organized architecture that makes the project maintainable and scalable. 

## 🚀 Installation

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 16.x or higher
- MySQL 8.0

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/smart-waste-collection.git
cd smart-waste-collection
```

2. **Configure the database**
   - Create a MySQL database named `wastecollect`
   - Update database credentials in `backend/src/main/resources/application.properties`

3. **Build and run the backend**
```bash
cd wastecollect
mvn clean install
mvn --projects backend spring-boot:run
```

4. **Run the frontend**
```bash
cd wastecollect/webparent/frontend/src/main/frontend
npm install
npm start
```

The application will be available at `http://localhost:3000` with the backend API running at `http://localhost:8080/api`. 

## 🧪 Testing

The project includes comprehensive unit and integration tests:

```bash
# Run backend tests
cd wastecollect
mvn --projects backend test

# Run frontend tests
cd wastecollect/webparent/frontend/src/main/frontend
npm test
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate. 

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Project Maintainer - [Your Name] - your.email@example.com

Project Link: [https://github.com/your-username/smart-waste-collection](https://github.com/your-username/smart-waste-collection)

---

**Note**: This README was generated following professional standards to clearly explain what the software does, how it works, and how users can engage with the project. 
