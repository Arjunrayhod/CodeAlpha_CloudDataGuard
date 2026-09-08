import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [page, setPage] = useState(
    new URLSearchParams(window.location.search).get("page") ||
      "dashboard"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [banExpiresAt, setBanExpiresAt] = useState(null);

  // Current time is used for the live ban countdown
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [stats, setStats] = useState({
    totalRecords: 0,
    uniqueRecords: 0,
    duplicateCount: 0,
    activeBans: 0,
  });

  const [records, setRecords] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [bans, setBans] = useState([]);

  const [recordSearch, setRecordSearch] = useState("");
  const [duplicateSearch, setDuplicateSearch] = useState("");
  const [banSearch, setBanSearch] = useState("");


  // Load all data when application starts
  useEffect(() => {
    loadStats();
    loadRecords();
    loadDuplicates();
    loadBans();
  }, []);


  // Update countdown every minute
  useEffect(() => {

    const timer = setInterval(() => {

      setCurrentTime(Date.now());

      loadStats();
      loadBans();

    }, 60000);


    return () => {
      clearInterval(timer);
    };

  }, []);


  // Change page
  function navigateTo(newPage) {

    setPage(newPage);

    const url =
      newPage === "dashboard"
        ? window.location.pathname
        : `${window.location.pathname}?page=${newPage}`;

    window.history.pushState({}, "", url);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // Browser back and forward button
  useEffect(() => {

    function handleBack() {

      const currentPage =
        new URLSearchParams(
          window.location.search
        ).get("page") || "dashboard";

      setPage(currentPage);
    }


    window.addEventListener(
      "popstate",
      handleBack
    );


    return () => {
      window.removeEventListener(
        "popstate",
        handleBack
      );
    };

  }, []);


  // Load dashboard statistics
  async function loadStats() {

    try {

      const response = await fetch(
        "http://localhost:5000/api/stats"
      );

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }

    } catch (error) {

      console.error(
        "Unable to load statistics:",
        error
      );

    }
  }


  // Load verified records
  async function loadRecords() {

    try {

      const response = await fetch(
        "http://localhost:5000/api/records"
      );

      const result = await response.json();

      if (result.success) {
        setRecords(result.data);
      }

    } catch (error) {

      console.error(
        "Unable to load records:",
        error
      );

    }
  }


  // Load duplicate history
  async function loadDuplicates() {

    try {

      const response = await fetch(
        "http://localhost:5000/api/duplicates"
      );

      const result = await response.json();

      if (result.success) {
        setDuplicates(result.data);
      }

    } catch (error) {

      console.error(
        "Unable to load duplicate history:",
        error
      );

    }
  }


  // Load ban history
  async function loadBans() {

    try {

      const response = await fetch(
        "http://localhost:5000/api/bans"
      );

      const result = await response.json();

      if (result.success) {
        setBans(result.data);
      }

    } catch (error) {

      console.error(
        "Unable to load ban history:",
        error
      );

    }
  }


  // Calculate remaining ban time
  function getRemainingTime(expiresAt) {

    const difference =
      new Date(expiresAt).getTime() -
      currentTime;


    if (difference <= 0) {
      return "Expired";
    }


    const totalMinutes = Math.ceil(
      difference / (1000 * 60)
    );


    const hours = Math.floor(
      totalMinutes / 60
    );


    const minutes =
      totalMinutes % 60;


    if (hours > 0) {

      return `${hours}h ${minutes}m remaining`;

    }


    return `${minutes}m remaining`;
  }


  // Add new record
  async function handleSubmit(event) {

    event.preventDefault();

    setMessage("");
    setMessageType("");
    setBanExpiresAt(null);


    try {

      const response = await fetch(
        "http://localhost:5000/api/records",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
          }),
        }
      );


      const result =
        await response.json();


      // Record successfully saved
      if (result.success) {

        setMessage(
          result.message
        );

        setMessageType(
          "success"
        );

        setName("");
        setEmail("");


        loadStats();
        loadRecords();
        loadDuplicates();
        loadBans();

        return;
      }


      // Email is banned
      if (result.banned) {

        setMessage(
          result.message
        );

        setMessageType(
          "banned"
        );

        setBanExpiresAt(
          result.expiresAt
        );


        loadStats();
        loadBans();

        return;
      }


      // Duplicate detected
      if (result.duplicate) {

        setMessage(
          result.message
        );

        setMessageType(
          "error"
        );


        loadStats();
        loadDuplicates();

        return;
      }


      // Validation error
      setMessage(
        result.message ||
          "Unable to save the record."
      );

      setMessageType(
        "error"
      );

    } catch (error) {

      console.error(
        "Connection error:",
        error
      );


      setMessage(
        "Unable to connect to the server."
      );

      setMessageType(
        "error"
      );

    }
  }


  // Search verified records
  const filteredRecords =
    records.filter((record) => {

      const searchText =
        recordSearch.toLowerCase();


      return (
        record.name
          .toLowerCase()
          .includes(searchText) ||

        record.email
          .toLowerCase()
          .includes(searchText)
      );

    });


  // Search duplicate history
  const filteredDuplicates =
    duplicates.filter((duplicate) => {

      const searchText =
        duplicateSearch.toLowerCase();


      return (
        duplicate.name
          .toLowerCase()
          .includes(searchText) ||

        duplicate.email
          .toLowerCase()
          .includes(searchText) ||

        duplicate.reason
          .toLowerCase()
          .includes(searchText)
      );

    });


  // Search ban history
  const filteredBans =
    bans.filter((ban) => {

      const searchText =
        banSearch.toLowerCase();


      const status =
        new Date(
          ban.expires_at
        ).getTime() > currentTime
          ? "active"
          : "expired";


      return (
        ban.email
          .toLowerCase()
          .includes(searchText) ||

        ban.ban_type
          .toLowerCase()
          .includes(searchText) ||

        status.includes(searchText)
      );

    });


  // Header
  function renderHeader() {

    return (

      <header className="topbar">

        <div
          className="brand"
          onClick={() =>
            navigateTo("dashboard")
          }
        >

          <h1>
            CloudDataGuard
          </h1>

          <p>
            Data Validation & Redundancy Management
          </p>

        </div>


        <div className="status">

          <span></span>

          System Online

        </div>

      </header>

    );
  }


  // Navigation
  function renderNavigation() {

    return (

      <nav className="navigation">

        <button
          className={
            page === "dashboard"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            navigateTo("dashboard")
          }
        >
          Dashboard
        </button>


        <button
          className={
            page === "records"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            navigateTo("records")
          }
        >
          Records
        </button>


        <button
          className={
            page === "duplicates"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            navigateTo("duplicates")
          }
        >
          Duplicate History
        </button>


        <button
          className={
            page === "bans"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            navigateTo("bans")
          }
        >
          Ban History
        </button>

      </nav>

    );
  }


  // Back button
  function renderBackButton() {

    return (

      <button
        className="back-button"
        onClick={() =>
          navigateTo("dashboard")
        }
      >
        ← Back to Dashboard
      </button>

    );
  }


  // Dashboard page
  function renderDashboard() {

    return (

      <>

        <section className="welcome">

          <div>

            <h2>
              Data Overview
            </h2>

            <p>
              Manage your data and monitor
              duplicate activity.
            </p>

          </div>

        </section>


        <section className="stats">

          <div className="card">

            <p>
              Total Records
            </p>

            <h3>
              {stats.totalRecords}
            </h3>

          </div>


          <div className="card">

            <p>
              Unique Records
            </p>

            <h3>
              {stats.uniqueRecords}
            </h3>

          </div>


          <div className="card">

            <p>
              Duplicates
            </p>

            <h3>
              {stats.duplicateCount}
            </h3>

          </div>


          <div className="card">

            <p>
              Active Bans
            </p>

            <h3>
              {stats.activeBans}
            </h3>

          </div>

        </section>


        <section className="main-grid">

          {/* Add Record */}

          <div className="panel">

            <h2>
              Add Record
            </h2>

            <p className="description">
              Enter a new record. The system
              will validate and check it for
              duplicates.
            </p>


            <form
              onSubmit={handleSubmit}
            >

              <label htmlFor="name">
                Name
              </label>


              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Enter name"
                required
              />


              <label htmlFor="email">
                Email
              </label>


              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter email"
                required
              />


              <button type="submit">
                Check & Save
              </button>

            </form>


            {message && (

              <div
                className={
                  `message ${messageType}`
                }
              >

                <div>
                  {message}
                </div>


                {banExpiresAt && (

                  <strong>
                    {getRemainingTime(
                      banExpiresAt
                    )}
                  </strong>

                )}

              </div>

            )}

          </div>


          {/* How It Works */}

          <div className="panel">

            <h2>
              How It Works
            </h2>


            <div className="step">

              <span>
                01
              </span>

              <div>

                <h3>
                  Enter Data
                </h3>

                <p>
                  User enters a new record.
                </p>

              </div>

            </div>


            <div className="step">

              <span>
                02
              </span>

              <div>

                <h3>
                  Validate
                </h3>

                <p>
                  Backend validates the data.
                </p>

              </div>

            </div>


            <div className="step">

              <span>
                03
              </span>

              <div>

                <h3>
                  Find Duplicate
                </h3>

                <p>
                  Existing emails are checked.
                </p>

              </div>

            </div>


            <div className="step">

              <span>
                04
              </span>

              <div>

                <h3>
                  Security Check
                </h3>

                <p>
                  Repeated duplicate attempts
                  are monitored.
                </p>

              </div>

            </div>


            <div className="step">

              <span>
                05
              </span>

              <div>

                <h3>
                  Save
                </h3>

                <p>
                  Only unique data is stored.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* Quick Links */}

        <section className="panel quick-links">

          <h2>
            System Management
          </h2>

          <p className="description">
            Open a section to view detailed
            information.
          </p>


          <div className="quick-link-grid">

            <button
              onClick={() =>
                navigateTo("records")
              }
            >

              <strong>
                Records
              </strong>

              <span>
                View verified records
              </span>

            </button>


            <button
              onClick={() =>
                navigateTo("duplicates")
              }
            >

              <strong>
                Duplicate History
              </strong>

              <span>
                View rejected attempts
              </span>

            </button>


            <button
              onClick={() =>
                navigateTo("bans")
              }
            >

              <strong>
                Ban History
              </strong>

              <span>
                View security bans
              </span>

            </button>

          </div>

        </section>

      </>

    );
  }


  // Records page
  function renderRecordsPage() {

    return (

      <>

        {renderBackButton()}


        <section className="panel records-panel">

          <div className="records-header">

            <div>

              <h2>
                Records
              </h2>

              <p className="description">
                View and search all verified
                records.
              </p>

            </div>


            <input
              className="search-input"
              type="text"
              placeholder="Search name or email..."
              value={recordSearch}
              onChange={(event) =>
                setRecordSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredRecords.length > 0 ? (

                  filteredRecords.map(
                    (record) => (

                      <tr
                        key={record.id}
                      >

                        <td>
                          {record.id}
                        </td>

                        <td>
                          {record.name}
                        </td>

                        <td>
                          {record.email}
                        </td>

                        <td>

                          <span className="verified">
                            {record.status}
                          </span>

                        </td>

                        <td>
                          {record.created_at}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="no-records"
                    >
                      No records found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </>

    );
  }


  // Duplicate history page
  function renderDuplicatesPage() {

    return (

      <>

        {renderBackButton()}


        <section className="panel records-panel">

          <div className="records-header">

            <div>

              <h2>
                Duplicate History
              </h2>

              <p className="description">
                View all rejected duplicate
                record attempts.
              </p>

            </div>


            <input
              className="search-input"
              type="text"
              placeholder="Search name, email or reason..."
              value={duplicateSearch}
              onChange={(event) =>
                setDuplicateSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="history-summary">

            Total duplicate attempts:{" "}

            <strong>
              {duplicates.length}
            </strong>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredDuplicates.length > 0 ? (

                  filteredDuplicates.map(
                    (duplicate) => (

                      <tr
                        key={duplicate.id}
                      >

                        <td>
                          {duplicate.id}
                        </td>

                        <td>
                          {duplicate.name}
                        </td>

                        <td>
                          {duplicate.email}
                        </td>

                        <td>
                          {duplicate.reason}
                        </td>

                        <td>
                          {duplicate.created_at}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="no-records"
                    >
                      No duplicate attempts found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </>

    );
  }


  // Ban history page
  function renderBansPage() {

    return (

      <>

        {renderBackButton()}


        <section className="panel records-panel">

          <div className="records-header">

            <div>

              <h2>
                Ban History
              </h2>

              <p className="description">
                View security bans created
                after repeated duplicate attempts.
              </p>

            </div>


            <input
              className="search-input"
              type="text"
              placeholder="Search email, type or status..."
              value={banSearch}
              onChange={(event) =>
                setBanSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="history-summary">

            Total bans:{" "}

            <strong>
              {bans.length}
            </strong>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Attempts
                  </th>

                  <th>
                    Ban Type
                  </th>

                  <th>
                    Banned At
                  </th>

                  <th>
                    Expires At
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredBans.length > 0 ? (

                  filteredBans.map(
                    (ban) => {

                      const isActive =
                        new Date(
                          ban.expires_at
                        ).getTime() >
                        currentTime;


                      return (

                        <tr
                          key={ban.id}
                        >

                          <td>
                            {ban.id}
                          </td>

                          <td>
                            {ban.email}
                          </td>

                          <td>
                            {ban.attempt_count}
                          </td>

                          <td>
                            {ban.ban_type}
                          </td>

                          <td>
                            {ban.banned_at}
                          </td>

                          <td>
                            {ban.expires_at}
                          </td>

                          <td>

                            {isActive ? (

                              <span className="ban-active">

                                {getRemainingTime(
                                  ban.expires_at
                                )}

                              </span>

                            ) : (

                              <span className="ban-expired">
                                Expired
                              </span>

                            )}

                          </td>

                        </tr>

                      );

                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="no-records"
                    >
                      No bans found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </>

    );
  }


  // Decide which page to display
  function renderPage() {

    if (page === "records") {
      return renderRecordsPage();
    }


    if (page === "duplicates") {
      return renderDuplicatesPage();
    }


    if (page === "bans") {
      return renderBansPage();
    }


    return renderDashboard();
  }
  return (
    <div className="app">
      {renderHeader()}
      {renderNavigation()}

      <main className="container">
        {renderPage()}
      </main>

      <footer className="creator-section">
        <div className="creator-content">
          <p className="creator-label">Created By</p>

          <h2>Arjun Rathod</h2>

          <p>Cloud Computing / BCA Student</p>

          <div className="creator-links">
            <a
              href="https://github.com/Arjunrayhod"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/arjun-rathod-offical/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>

            <a href="mailto:rathodarjun2513@gmail.com">
              Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;