import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ViewProjects = () => {
    const [projects, setProjects] = useState([]);
    const { currentUser } = useSelector(state => state.user);

    async function getProjects() {
        console.log(currentUser);
        await axios.get('http://localhost:9000/api/service/getProjects', {
            id: currentUser.id
        })
            .then(response => setProjects(response.data))
            .catch(error => console.error(error));
    }

    useEffect(() => {
        getProjects();
    }, []);

    const handleDeploy = (projectId) => {
        axios.post('http://localhost:9000/deploy', { projectId })
            .then(response => {
                alert('Deployment started!');
                // Optionally refresh the projects list to show the new deployment status
                getProjects();
            })
            .catch(error => console.error(error));
    };

    const handleViewDeployments = (projectId) => {
        // Redirect or fetch deployments for the project
        alert(`View deployments for project ID: ${projectId}`);
    };

    const handleAddDeployment = (projectId) => {
        // Logic to add another deployment
        handleDeploy(projectId);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Projects</h1>
            <ul className="space-y-4">
                {projects.map((project) => (
                    <li key={project.id} className="bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-2xl font-semibold mb-2">{project.name}</h2>
                        <p className="text-gray-700">
                            <span className="font-medium">Git URL:</span> {project.gitURL}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Subdomain:</span> {project.subDomain}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Custom Domain:</span> {project.customDomain}
                        </p>
                        {project.projectURL && (
                            <div className="mt-4">
                                <button
                                    onClick={() => handleViewDeployments(project.id)}
                                    className="mr-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                                >
                                    View Deployments
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => handleAddDeployment(project.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                            Add Deployment
                        </button>

                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ViewProjects;
