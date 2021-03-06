# TaskDesk


**Warning: Work in progress. This project is in a very early stage.**


Modern project management tool with advanced analytics.


## Technologies:
- Vue.js
- Chart.js
- Element UI
- Node.js
- Apollo
- GraphQL
- MongoDB
- ...


## Goals
- Tracking and reporting on long term projects.
- Visualization of project and employee statistics.
- High degree of customization to support many types of organizations.
- Built on modern and highly scalable technologies.


## What is done
- Separate frontend and backend (can be run on separate instances)
- GraphQL API
- Basic security and registration
- Project structure and nesting
- Rich text editor for project description
- Project start and end date - datepicker
- Visualization of project progress
- Simple Gantt chart for subprojects
- Project status tracking
- Search bar


## TODO
- Project tags
- Breadcrumb navigation
- Custom project metadata
- Teams and team members administration
- Team allocation to projects
- Team detailed allocation chart
- Responsive UI layout
- Integration with security providers
- More visualizations - employee allocation, project spending, etc. 
- Project deadline/delay prediction
- Tests
- ...


<img src="screenshot.png" />

## Run in docker

Note: this is a docker image to play around and it currently contains all the components in one image.

Build
```bash
docker build -t taskdesk .
```

Run
```bash
docker run -it --rm -p 8080:8080 -p 5500:5500 taskdesk
```

Access the UI: http://localhost:8080/

GraphQL Backend: http://localhost:5500/playground
