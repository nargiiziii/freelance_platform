// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getOpenProjects, sendProposal } from '../../redux/features/projectSlice';

// const ProjectsList = () => {
//   const dispatch = useDispatch();
//   const { items: projects, status } = useSelector((state) => state.projects);
//   const [submitted, setSubmitted] = useState({}); // {projectId: true}

//   useEffect(() => {
//     dispatch(getOpenProjects());
//   }, [dispatch]);

//   const handleSendProposal = (projectId) => {
//     const coverLetter = prompt('Введите сопроводительное письмо:');
//     const price = prompt('Введите вашу цену:');

//     if (!coverLetter || !price) return;

//     dispatch(sendProposal({ projectId, coverLetter, price }))
//       .unwrap()
//       .then(() => {
//         setSubmitted((prev) => ({ ...prev, [projectId]: true }));
//       })
//       .catch((err) => alert('Ошибка: ' + err));
//   };

//   if (status === 'loading') return <p>Загрузка проектов...</p>;

//   return (
//     <div>
//       <h2>Доступные проекты</h2>
//       {projects.length === 0 && <p>Нет доступных проектов</p>}
//       {projects.map((project) => (
//         <div key={project._id} style={{ border: '1px solid gray', padding: '10px', marginBottom: '10px' }}>
//           <h3>{project.title}</h3>
//           <p>{project.description}</p>
//           <p><strong>Навыки:</strong> {project.skillsRequired.join(', ')}</p>
//           <p><strong>Бюджет:</strong> {project.budget}₽</p>
//           <button
//             onClick={() => handleSendProposal(project._id)}
//             disabled={submitted[project._id]}
//           >
//             {submitted[project._id] ? 'Отклик отправлен' : 'Взять проект'}
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ProjectsList;
