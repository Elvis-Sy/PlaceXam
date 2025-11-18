import React, { useEffect, useState, useRef } from "react";
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
import DataTable from "../../../components/ui/DataTable";
import { CircularProgress } from "@mui/material";
import { Zap } from "lucide-react";

/**
 * Hook minimal pour animer un compteur de 0 -> target.
 * duration en ms.
 */
function useCountUp(target, duration = 800, start = 0, run = true) {
  const [value, setValue] = useState(start);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!run) {
      setValue(target);
      return;
    }
    const from = Number(start ?? 0);
    const to = Number(target ?? 0);
    const diff = to - from;
    if (diff === 0) {
      setValue(to);
      return;
    }
    const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

    const tick = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutQuad(progress);
      const current = Math.round(from + diff * eased);
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, run]);

  return value;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalRooms: 0,
    totalSurveillants: 0,
    unassignedStudents: [],
    roomsWithoutSupervisors: [],
  });
  const [loading, setLoading] = useState(true);

  // UI states
  const [btnLoadingStudents, setBtnLoadingStudents] = useState(false);
  const [btnLoadingSupervisors, setBtnLoadingSupervisors] = useState(false);

  // refreshKey forces DataTable remount to ensure fresh rendering
  const [refreshKey, setRefreshKey] = useState(0);
  // flash state for a brief highlight when table refreshed
  const [flash, setFlash] = useState(false);
  // only animate counts the first time
  const [countsAnimated, setCountsAnimated] = useState(false);

  const prevCountsRef = useRef({
    students: 0,
    exams: 0,
    rooms: 0,
    surveillants: 0,
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardData();
      // ensure keys exist
      const normalized = {
        totalStudents: Number(data?.totalStudents ?? 0),
        totalExams: Number(data?.totalExams ?? 0),
        totalRooms: Number(data?.totalRooms ?? 0),
        totalSurveillants: Number(data?.totalSurveillants ?? 0),
        unassignedStudents: Array.isArray(data?.unassignedStudents) ? data.unassignedStudents : [],
        roomsWithoutSupervisors: Array.isArray(data?.roomsWithoutSupervisors) ? data.roomsWithoutSupervisors : [],
      };
      setDashboardData(normalized);

      // trigger remount/refresh of DataTable
      setRefreshKey((k) => k + 1);
      // flash highlight
      setFlash(true);
      setTimeout(() => setFlash(false), 700);

      // mark countsAnimated only the first time (page load)
      if (!countsAnimated) {
        setCountsAnimated(true);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setDashboardData({
        totalStudents: 0,
        totalExams: 0,
        totalRooms: 0,
        totalSurveillants: 0,
        unassignedStudents: [],
        roomsWithoutSupervisors: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAutoAssignStudents = async () => {
    try {
      setBtnLoadingStudents(true);
      const res = await autoAssignStudents();
      console.info("Auto-assign students result:", res);
      // re-fetch and refresh tables
      await loadDashboardData();
    } catch (err) {
      console.error("Auto assign students error:", err);
    } finally {
      setBtnLoadingStudents(false);
    }
  };

  const handleAutoAssignSupervisors = async () => {
    try {
      setBtnLoadingSupervisors(true);
      const res = await autoAssignSupervisors();
      console.info("Auto-assign supervisors result:", res);
      await loadDashboardData();
    } catch (err) {
      console.error("Auto assign supervisors error:", err);
    } finally {
      setBtnLoadingSupervisors(false);
    }
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
  const totalSurveillants = Number(dashboardData?.totalSurveillants ?? 0);

  // animated counters - run only on first data load (countsAnimated toggles to true)
  const animate = countsAnimated; // we set to true in loadDashboardData after first fetch
  const animatedStudents = useCountUp(totalStudents, 900, prevCountsRef.current.students, animate);
  const animatedExams = useCountUp(totalExams, 900, prevCountsRef.current.exams, animate);
  const animatedRooms = useCountUp(totalRooms, 900, prevCountsRef.current.rooms, animate);
  const animatedSurveillants = useCountUp(totalSurveillants, 900, prevCountsRef.current.surveillants, animate);

  // update prevCountsRef when actual numbers change (so future animations start from the last value)
  useEffect(() => {
    prevCountsRef.current = {
      students: totalStudents,
      exams: totalExams,
      rooms: totalRooms,
      surveillants: totalSurveillants,
    };
  }, [totalStudents, totalExams, totalRooms, totalSurveillants]);

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

  const studentsColumns = [
    {
      field: "fullname",
      headerName: "Name",
      width: 260,
    },
    {
      field: "examLabel",
      headerName: "Exam",
      width: 200,
      renderCell: (row) => getStudentExamLabel(row),
    },
    {
      field: "niveau",
      headerName: "Level",
      width: 100,
    },
  ];

  const roomsColumns = [
    {
      field: "label",
      headerName: "Room",
      width: 220,
    },
    {
      field: "capacite",
      headerName: "Capacity",
      width: 140,
      renderCell: (room) => (room.capacite ?? room.capacity ?? "-"),
    },
  ];

  // small inline style for table flash
  const tableFlashStyle = {
    transition: "background-color 400ms ease",
    backgroundColor: flash ? "#f0fff4" : "#ffffff",
    borderRadius: 6,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

      {/* KPIs */}  
      <div className="flex flex-col flex-1 sm:flex-row gap-4 mb-6">
        <div className="bg-white flex-1 shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Students</h2>
          <p className="text-2xl font-bold">{animatedStudents}</p>
        </div>
        <div className="bg-white flex-1 shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Supervisors</h2>
          <p className="text-2xl font-bold">{animatedSurveillants}</p>
        </div>
        <div className="bg-white flex-1 shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Exams</h2>
          <p className="text-2xl font-bold">{animatedExams}</p>
        </div>
        <div className="bg-white flex-1 shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Rooms</h2>
          <p className="text-2xl font-bold">{animatedRooms}</p>
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
        <div style={tableFlashStyle} className="shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Rooms Without Supervisors</h2>
            <button
              type="button"
              onClick={handleAutoAssignSupervisors}
              disabled={btnLoadingSupervisors}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded shadow transform transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {btnLoadingSupervisors ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <>
                  <Zap size={16} />
                  Auto Assign
                </>
              )}
            </button>
          </div>
          <DataTable
            key={`rooms-${refreshKey}`}
            columns={roomsColumns}
            rows={roomsWithout}
            initialPageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            options={{
              search: true,
              paging: false,
              sorting: false,
              headerStyle: { backgroundColor: "#f5f5f5", fontWeight: "bold" },
              rowStyle: { borderBottom: "1px solid #e0e0e0" },
            }}
          />
        </div>


        
      </div>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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
        {/* Unassigned Students */}
        <div style={tableFlashStyle} className="shadow rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Unassigned Students</h2>
            <button
              type="button"
              onClick={handleAutoAssignStudents}
              disabled={btnLoadingStudents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded shadow transform transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {btnLoadingStudents ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <>
                  <Zap size={16} />
                  Auto Assign
                </>
              )}
            </button>
          </div>
          <DataTable
            key={`students-${refreshKey}`}
            columns={studentsColumns}
            rows={unassigned}
            initialPageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            onRowClick={(row) => {
              // optional navigation
            }}
          />
        </div>
        

        
    </div>
  </div>
  );
}
