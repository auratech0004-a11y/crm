import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../../lib/api';
import { MapPin, Calendar, Filter } from 'lucide-react';

const AdminAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDepartment, setFilterDepartment] = useState('');

  useEffect(() => {
    loadData();
  }, [filterDate]);

  const loadData = async () => {
    try {
      const [empData, attData] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll({ date: filterDate }),
      ]);
      setEmployees(empData.filter((e) => e.role === 'EMPLOYEE'));
      setAttendance(attData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecordForEmployee = (empId) => {
    return attendance.find((a) => a.employee_id === empId);
  };

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];
  const filteredEmployees = filterDepartment
    ? employees.filter((e) => e.department === filterDepartment)
    : employees;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up" data-testid="admin-attendance">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Real-time attendance of all employees</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-foreground"
              data-testid="date-filter"
            />
          </div>
          {departments.length > 0 && (
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-transparent outline-none text-sm text-foreground"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-border">
                <th className="px-8 py-5">Employee</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Check In</th>
                <th className="px-8 py-5">Check Out</th>
                <th className="px-8 py-5">Working Hours</th>
                <th className="px-8 py-5">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((emp) => {
                const record = getRecordForEmployee(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-secondary/50 transition-colors" data-testid={`attendance-row-${emp.id}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary border border-border">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        record?.status === 'Present' ? 'bg-success/10 text-success border-success/30' :
                        record?.status === 'Late' ? 'bg-warning/10 text-warning border-warning/30' :
                        'bg-destructive/10 text-destructive border-destructive/30'
                      }`}>
                        {record?.status || 'Absent'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-foreground">{record?.check_in || '--:--'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-foreground">{record?.check_out || '--:--'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-foreground">
                        {record?.working_hours ? `${record.working_hours} hrs` : '-'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      {record?.location ? (
                        <div className="flex items-center gap-2 text-primary text-xs">
                          <MapPin className="w-4 h-4" />
                          <span>{record.location.address || 'View Map'}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No data</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-muted-foreground italic">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
