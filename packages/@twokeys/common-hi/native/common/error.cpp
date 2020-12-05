#include "error.h"

namespace twokeys {
  GenericWinError new_generic_win_error() {
    GenericWinError run_err;
    run_err.is_error = false;
    return run_err;
  }
}