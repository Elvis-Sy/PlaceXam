import React, { useEffect, useState } from "react";
import {
  fetchDashboardData,
  autoAssignStudents,
  autoAssignSupervisors,
} from "../../../services/dashboard";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    unassignedStudents: [],
    roomsWithoutSupervisors: [],
    totalStudents: 0,
    totalExams: 0,
    totalRooms: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      setDashboardData(data || {});
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setDashboardData({
        unassignedStudents: [],
        roomsWithoutSupervisors: [],
        totalStudents: 0,
        totalExams: 0,
        totalRooms: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAutoAssignStudents = async () => {
    await autoAssignStudents();
    await loadDashboardData(); // re-fetch — no reload
  };

  const handleAutoAssignSupervisors = async () => {
    await autoAssignSupervisors();
    await loadDashboardData(); // re-fetch — no reload
  };

  // Null-safe arrays + properties
  const unassigned = Array.isArray(dashboardData?.unassignedStudents)
    ? dashboardData.unassignedStudents
    : [];
  const roomsWithout = Array.isArray(dashboardData?.roomsWithoutSupervisors)
    ? dashboardData.roomsWithoutSupervisors
    : [];
  const totalStudents = Number(dashboardData?.totalStudents ?? 0);
  const totalRooms = Number(dashboardData?.totalRooms ?? 0);
  const totalExams = Number(dashboardData?.totalExams ?? 0);

  if (loading) return <div className="p-4">Loading dashboard…</div>;

  // Pie + bar data
  const assignedCount = Math.max(0, totalStudents - unassigned.length);
  const pieData = [
    { name: "Assigned", value: assignedCount },
    { name: "Unassigned", value: unassigned.length },
  ];

  const barData = [
    {
      name: "Rooms with Supervisors",
      value: Math.max(0, totalRooms - roomsWithout.length),
    },
    { name: "Rooms without Supervisors", value: roomsWithout.length },
  ];

  const COLORS = ["#68b6ff", "#faffd0"];

  const getStudentExamLabel = (student) => {
    // Prefer server-provided examLabel
    if (student?.examLabel) return student.examLabel;
    // Otherwise fallback to nested structure
    if (Array.isArray(student?.Affectations) && student.Affectations.length > 0) {
      const aff = student.Affectations[0];
      if (aff?.Exam?.Matiere?.label) return aff.Exam.Matiere.label;
      if (aff?.Exam?.id) return `Exam ${aff.Exam.id}`;
      if (aff?.examId) return aff.examId;
    }
    return "-";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Students</h2>
          <p className="text-2xl font-bold">{totalStudents}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Exams</h2>
          <p className="text-2xl font-bold">{totalExams}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Rooms</h2>
          <p className="text-2xl font-bold">{totalRooms}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Student Assignment</h2>
          <PieChart width={400} height={300}>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Room Supervision</h2>
          <BarChart width={400} height={300} data={barData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#68b6ff" />
          </BarChart>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Unassigned Students */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Unassigned Students</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Exam</th>
                <th className="border border-gray-300 p-2">Level</th>
              </tr>
            </thead>
            <tbody>
              {unassigned.length === 0 ? (
                <tr>
                  <td className="p-2 text-center" colSpan="3">
                    No unassigned students.
                  </td>
                </tr>
              ) : (
                unassigned.map((student) => (
                  <tr key={student.id}>
                    <td className="border border-gray-300 p-2">
                      {student.fullname || student.name || student.email || "-"}
                    </td>
                    <td className="border border-gray-300 p-2">{getStudentExamLabel(student)}</td>
                    <td className="border border-gray-300 p-2">{student.niveau || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rooms without supervisors */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-4">Rooms Without Supervisors</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Room</th>
                <th className="border border-gray-300 p-2">Capacity</th>
              </tr>
            </thead>
            <tbody>
              {roomsWithout.length === 0 ? (
                <tr>
                  <td className="p-2 text-center" colSpan="2">
                    All rooms are supervised.
                  </td>
                </tr>
              ) : (
                roomsWithout.map((room) => (
                  <tr key={room.id}>
                    <td className="border border-gray-300 p-2">{room.label || room.name || "-"}</td>
                    <td className="border border-gray-300 p-2">{room.capacite ?? room.capacity ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded shadow" onClick={handleAutoAssignStudents} type="button">
          Auto-Assign Students
        </button>

        <button className="bg-green-500 text-white font-bold py-2 px-4 rounded shadow" onClick={handleAutoAssignSupervisors} type="button">
          Auto-Assign Supervisors
        </button>
      </div>
    </div>
  );
}
