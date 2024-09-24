{#MODAL#:
  <div class="modal fade" id="settingsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="settingsModalTitle">Settings</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body center">
        <ul class="list-group">
          <li class="list-group-item">
            <div class="row">
              <div class="col">
                Factory Reset <i class="bi bi-arrow-clockwise"></i>
              </div>
              <div class="col">
              <button id="factoryResetBtn" type="button" class="btn btn-danger" data-bs-toggle="collapse" data-bs-target="#settingsModal">
                  <i class="bi bi-trash"></i>
                </button>
                </div>
            </div>
          </li>

          <div class="input-group settingsItem">
            <span class="input-group-text" id="basic-addon1"><i class="bi bi-person-circle"></i></span>
              <input id="exUsername" type="text" class="form-control" placeholder="Existent Username" aria-label="Username" aria-describedby="basic-addon1">
              <button data-bs-dismiss="modal" id="loginAUsernameBTN" class="btn btn-outline-danger" type="button" id="button-addon1">Submit</button>
          </div>
          <br />
          <div class="text-center"> 
          Do you have an Account? 
          <br />
          No! 
          <br />
          Go Here <i class="bi bi-arrow-down"></i>
          </div>

          <div class="input-group mb-3 settingsItem">
            <button data-bs-dismiss="modal" id="createThenewUsernameBTN" class="btn btn-outline-danger" type="button" id="button-addon1">New <i class="bi bi-person-circle"></i></button>
            <input id="newUsername" type="text" class="form-control" placeholder="new User?" aria-label="Example text with button addon" aria-describedby="button-addon1">
          </div>

        </div>
      </div>
  </div>
</div>
:##}

