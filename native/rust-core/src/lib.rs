//! NEXCODE AI - Native Rust Core
//! Ultra-fast indexing and AST token processing.

#[no_mangle]
pub extern "C" fn nexcode_core_version() -> *const u8 {
    b"0.1.0\0".as_ptr()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_core_version() {
        assert_eq!(nexcode_core_version().is_null(), false);
    }
}
