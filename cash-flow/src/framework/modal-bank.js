{#DOCREADY#:
    $("#liveToastBtnBank").off('click').on('click', function() {
        var str = document.getElementById("newBankIncome").value
        console.log("saved money input" + str);
        var flt = parseFloat(str)
        console.log(" float: " + flt)
        if (isNaN(flt))
            flt = 0;
        addBank(flt)
        localStorage.setItem("bank", bank)
        redisplay()

        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToastBank'))
        toastBootstrap.show()
    });
    :##}


{#MODAL#:
    <div class="modal fade" id="bankModal" tabindex="-1" aria-labelledby="bankModal" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="bankModal">Add Money to the Bank Acc</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"><i class="bi bi-cash-stack"></i></span>
              <input id="newBankIncome" type="text" class="form-control" placeholder="New Income" aria-describedby="basic-addon1" />
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1"><i class="bi bi-chat-dots"></i></span>
              <input id="addBankMoneyComment" type="text" class="form-control" placeholder="Comment" aria-describedby="basic-addon1" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="document.getElementById('newBankIncome').value = ''" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button id="liveToastBtnBank" type="button" data-bs-dismiss="modal" class="btn btn-dark">Save changes</button>
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
