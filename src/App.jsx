import Sidebar from "./Components/Sidebar"
import Dashboard from "./Components/Dashboard"

function App() {

  return (
    <>
      <div className="w-full flex">
        <Sidebar/>

        <main className="grow">
          <Dashboard/>
        </main>
      </div>
    </>
  )
}

export default App
