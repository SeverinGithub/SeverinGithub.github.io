{#DOCREADY#:
const toastTrigger1 = document.getElementById('liveToastBtnCash')
const toastLiveExample1 = document.getElementById('liveToastCash')

        if (toastTrigger1) {
          const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample1)
          toastTrigger1.addEventListener('click', () => {
          toastBootstrap.show()
          })
        }
:##}

{#TOAST#:
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div id="liveToastCash" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
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
