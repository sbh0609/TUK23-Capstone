return (
    <div className="LoginPage">
      <div className="LoginPage-Background">
      </div>
      
      <div className="enter-your-github-outer">
        <div className="enter-your-github-inner">
          <p className= "enter-Phrase">Enter your</p>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hyperlink-github">Github</a>
        </div>
      </div>

      <div className="LoginPage-LoginBox">
        <div className="LoginPage-LoginBox-Username">
          <p className="username">Username</p>
          <label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Username"
            />
          </label>
          <p className="organizations">Organizations</p>
        </div>
        
        {organizations.map((organization, index)=> (
          <div key={index} className="organization-box">
            <label>
              <input
                type="text"
                value={organization}
                onChange={(e) => handleOrganizationChange(index, e)}
                placeholder={`Organization ${index + 1}`}
               />
            </label> <br />
          </div>
          ))}
          <button onClick={handleAddOrganiztionButton} className="LoginPage-AddOrganizationButton">+ Add Organization</button><br />
          <button onClick={handleSubmit} className="LoginPage-EnterButton">Enter</button>
      </div>
    </div>
    );
}


export default LoginPage;