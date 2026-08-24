import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8081/api";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title:"", description:"", dueDate:"", status:"PENDING" });
  const [editId, setEditId] = useState(null);

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks/student/${user.id}`);
    setTasks(res.data);
  };
  useEffect(()=>{ if(user) fetchTasks(); }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister? `${API}/auth/register` : `${API}/auth/login`;
      const payload = isRegister? form : { email: form.email, password: form.password };
      const res = await axios.post(url, payload);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
    } catch(err){ alert(err.response?.data || "Error"); }
  };

  const handleTask = async (e) => {
    e.preventDefault();
    const payload = {...taskForm, studentId: user.id };
    if(editId){ await axios.put(`${API}/tasks/${editId}`, payload); setEditId(null); }
    else{ await axios.post(`${API}/tasks`, payload); }
    setTaskForm({ title:"", description:"", dueDate:"", status:"PENDING" });
    fetchTasks();
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  if(!user){
    return (
      <div style={{maxWidth:"400px", margin:"80px auto", fontFamily:"Arial"}}>
        <h2>🎓 Student Task Manager</h2>
        <h3>{isRegister? "Register" : "Login"}</h3>
        <form onSubmit={handleAuth}>
          {isRegister && <input placeholder="Name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={s.input}/>}
          <input placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={s.input}/>
          <input placeholder="Password" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={s.input}/>
          <button style={s.btn}>{isRegister? "Register" : "Login"}</button>
        </form>
        <p onClick={()=>setIsRegister(!isRegister)} style={{cursor:"pointer", color:"blue"}}>{isRegister? "Already have account? Login" : "New? Register"}</p>
      </div>
    );
  }

  return (
    <div style={{maxWidth:"800px", margin:"20px auto", fontFamily:"Arial"}}>
      <div style={{display:"flex", justifyContent:"space-between"}}><h2>Welcome, {user.name} 👋</h2><button onClick={logout} style={s.btn}>Logout</button></div>

      <form onSubmit={handleTask} style={s.card}>
        <h3>{editId? "Edit Task" : "Add New Task"}</h3>
        <input placeholder="Title" required value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} style={s.input}/>
        <input placeholder="Description" value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} style={s.input}/>
        <input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm,dueDate:e.target.value})} style={s.input}/>
        <select value={taskForm.status} onChange={e=>setTaskForm({...taskForm,status:e.target.value})} style={s.input}>
          <option>PENDING</option><option>IN_PROGRESS</option><option>COMPLETED</option>
        </select>
        <button style={s.btn}>{editId? "Update" : "Add Task"}</button>
      </form>

      <div>{tasks.map(t=>(
        <div key={t.id} style={s.card}>
          <b>{t.title}</b> - {t.status} <br/><small>{t.description} | Due: {t.dueDate}</small><br/>
          <button onClick={()=>{setTaskForm({title:t.title, description:t.description, dueDate:t.dueDate||"", status:t.status}); setEditId(t.id);}} style={s.small}>Edit</button>
          <button onClick={async()=>{await axios.delete(`${API}/tasks/${t.id}`); fetchTasks();}} style={{...s.small, background:"red"}}>Delete</button>
        </div>
      ))}</div>
    </div>
  );
}
const s = {
  input:{width:"100%", padding:"10px", margin:"6px 0", borderRadius:"6px", border:"1px solid #ccc"},
  btn:{padding:"10px 16px", background:"#6c5ce7", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer"},
  card:{border:"1px solid #eee", padding:"15px", borderRadius:"10px", margin:"12px 0", boxShadow:"0 2px 8px #eee"},
  small:{padding:"5px 10px", margin:"5px", background:"#00b894", color:"#fff", border:"none", borderRadius:"5px", cursor:"pointer"}
};
export default App;