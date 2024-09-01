{#MODAL#:
    <div class="modal fade" id="cashModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add Money to your Wallet</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
          <div class="text-center cssitem">
          <button type="button" class="btn btn-outline-danger" disabled>JJJJ MM DD</button>
          </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"><i class="bi bi-cash-stack"></i></span>
              <input id="newCashIncome" type="text" class="form-control" placeholder="New Income" aria-describedby="basic-addon1" />
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"><i class="bi bi-cash"></i></span>
              <input id="setTotalCash" type="text" class="form-control" placeholder="Set Total" aria-describedby="basic-addon1" />
            </div>
            <div class="modal-footer">
              <button type="button" onclick="document.getElementById('newCashIncome').value = ''" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button id="SaveChangesBtnCash" type="button" data-bs-dismiss="modal" class="btn btn-dark">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
:##}
