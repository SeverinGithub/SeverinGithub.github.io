
{#MODAL#:
    <div class="modal fade" id="bankModal" tabindex="-1" aria-labelledby="bankModal" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="bankModal">Add Money to the Bank Acc</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
          <div class="text-center cssitem">
          <button type="button" class="btn btn-outline-danger" disabled><span id="todaysDateBank"></span></button>
          </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"><i class="bi bi-cash-stack"></i></span>
              <input id="newBankIncome" type="text" class="form-control" placeholder="New Income" aria-describedby="basic-addon1" />
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"><i class="bi bi-cash"></i></span>
              <input id="setTotalBank" type="text" class="form-control" placeholder="Set Total" aria-describedby="basic-addon1" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="document.getElementById('newBankIncome').value = ''" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button id="SaveChangesBtnBank" type="button" data-bs-dismiss="modal" class="btn btn-dark">Save changes</button>
          </div>
        </div>
      </div>
    </div>
:##}

{#TOAST#:
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
          <div id="liveToastBank" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
              <i class="bi bi-cash">&nbsp;</i>
              <strong class="me-auto">Bootstrap</strong>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              Your account has been addet money
            </div>
          </div>
        </div>
:##}
