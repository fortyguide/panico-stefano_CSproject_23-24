import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ email: '', name: '', surname: '', role: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers(filters, page);
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      setMessage('Errore durante il recupero degli utenti.');
    }
  };

  const handleRoleChange = (e) => {
    setNewRole(e.target.value);
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    setShowPopup(true);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserRole(selectedUser, newRole);
      fetchUsers();
      setShowPopup(false);
    } catch (error) {
      setMessage('Errore durante l\'aggiornamento del ruolo.');
    }
  };

  return (
    <div className="user-management-page">
      <h1>Gestione Utenti</h1>
      {message && <p className="message">{message}</p>}
      <form className="filters" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }}>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="text" value={filters.email} onChange={handleFilterChange} />
        </div>
        <div>
          <label htmlFor="name">Nome:</label>
          <input id="name" name="name" type="text" value={filters.name} onChange={handleFilterChange} />
        </div>
        <div>
          <label htmlFor="surname">Cognome:</label>
          <input id="surname" name="surname" type="text" value={filters.surname} onChange={handleFilterChange} />
        </div>
        <div>
          <label htmlFor="role">Ruolo:</label>
          <select id="role" name="role" value={filters.role} onChange={handleFilterChange}>
            <option value="">Seleziona un ruolo</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <button type="submit">Cerca</button>
      </form>
      <table className="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Ruolo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td>
                {user.role}
                <button className="edit-role-btn" onClick={() => handleUserChange(user.id)}>Modifica Ruolo</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Precedente</button>
        <span>Pagina {page} di {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Successivo</button>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Modifica Ruolo</h2>
            <form onSubmit={handleSubmit} className="role-form">
              <label>
                Nuovo Ruolo:
                <select value={newRole} onChange={handleRoleChange} required>
                  <option value="">Seleziona un ruolo</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>
              <button type="submit">Aggiorna Ruolo</button>
              <button type="button" onClick={() => setShowPopup(false)} className="cancel-btn">Annulla</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;