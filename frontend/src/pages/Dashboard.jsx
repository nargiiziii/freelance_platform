// src/pages/Dashboard.jsx
import React, { useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);


  return (
    <div>
      <h2>Личный кабинет</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Загрузка...</p>}
    </div>
  );
}

export default Dashboard;
