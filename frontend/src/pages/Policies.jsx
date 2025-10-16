import { Plus, Search } from 'lucide-react'
import './Pages.css'

function Policies() {
  const policies = [
    { id: 1, title: 'Quality Management Policy', status: 'Published', version: '2.1', updated: '2024-01-15' },
    { id: 2, title: 'Environmental Policy', status: 'In Review', version: '1.3', updated: '2024-01-10' },
    { id: 3, title: 'Health & Safety Policy', status: 'Published', version: '3.0', updated: '2024-01-05' },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Policy Management</h2>
        <button className="btn btn-primary">
          <Plus size={20} />
          New Policy
        </button>
      </div>

      <div className="search-box">
        <Search size={20} />
        <input type="text" placeholder="Search policies..." />
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Version</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.title}</td>
                <td>
                  <span className={`badge badge-${policy.status === 'Published' ? 'success' : 'warning'}`}>
                    {policy.status}
                  </span>
                </td>
                <td>{policy.version}</td>
                <td>{policy.updated}</td>
                <td>
                  <button className="btn-link">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Policies
