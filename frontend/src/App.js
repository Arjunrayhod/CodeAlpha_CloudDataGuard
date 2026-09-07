import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>CloudDataGuard</h1>
          <p>Data validation & redundancy management</p>
        </div>

        <div className="status">
          <span></span>
          System Online
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <div>
            <h2>Data Overview</h2>
            <p>
              Keep your data clean by detecting duplicates before they are
              stored.
            </p>
          </div>

          <button>Add New Record</button>
        </section>

        <section className="stats">
          <div className="card">
            <p>Total Records</p>
            <h3>0</h3>
          </div>

          <div className="card">
            <p>Unique Records</p>
            <h3>0</h3>
          </div>

          <div className="card">
            <p>Duplicates</p>
            <h3>0</h3>
          </div>

          <div className="card">
            <p>Files Stored</p>
            <h3>0</h3>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <h2>Quick Add</h2>
            <p className="panel-text">
              Add a record and the system will automatically check for
              duplicates.
            </p>

            <form>
              <label>Name</label>
              <input type="text" placeholder="Enter name" />

              <label>Email</label>
              <input type="email" placeholder="Enter email" />

              <button type="submit">Check & Save</button>
            </form>
          </div>

          <div className="panel">
            <h2>How it works</h2>

            <div className="step">
              <strong>01</strong>
              <div>
                <h3>Enter data</h3>
                <p>User submits a new record.</p>
              </div>
            </div>

            <div className="step">
              <strong>02</strong>
              <div>
                <h3>Validate</h3>
                <p>The system checks the submitted information.</p>
              </div>
            </div>

            <div className="step">
              <strong>03</strong>
              <div>
                <h3>Detect duplicate</h3>
                <p>Existing records are checked before saving.</p>
              </div>
            </div>

            <div className="step">
              <strong>04</strong>
              <div>
                <h3>Store safely</h3>
                <p>Only valid and unique records are saved.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;