import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer"; 
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginRight: drawerWidth,
    }),
  })
);

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

const ShadowListItem = styled(ListItem)(({ theme }) => ({
  margin: theme.spacing(0.5, 2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: "box-shadow 0.2s",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
  backgroundColor: theme.palette.background.paper,
}));

export default function PersistentDrawerRight({ onApiKeySubmit, onFileSubmit }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [api, setApi] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [images, setImages] = React.useState([]);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [url, setUrl] = React.useState(""); // <-- NEW: URL state

  React.useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const res = await fetch("http://localhost:8000/uploaded_files");
        const data = await res.json();
        setUploadedFiles(data.files || []);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
        setUploadedFiles([]);
      }
    };
    if (open) fetchUploadedFiles();
  }, [open]);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      alert("Please enter a valid URL.");
      return;
    }
    try {
      setIsUploading(true);
      const res = await fetch("http://localhost:8000/scrape_website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      });
      const data = await res.json();
      alert(data.message);
      setUrl("");
      // Optionally, trigger a refresh of uploaded files
      const filesRes = await fetch("http://localhost:8000/uploaded_files");
      const filesData = await filesRes.json();
      setUploadedFiles(filesData.files || []);
    } catch (error) {
      console.error("URL Scraping Error:", error);
      alert("Failed to scrape website");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApiSubmit = async () => {
    if (!api.trim()) {
      alert("Please enter your API key.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/set_api_key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: api }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "API key accepted.");
        if (typeof onApiKeySubmit === "function") {
          onApiKeySubmit(true);
        }
      } else {
        alert(data.message || "Failed to submit API key.");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to submit API key due to an error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/upload_pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        if (data.images) {
          setImages(data.images);
          setShowImageModal(true);
        }
        const filesRes = await fetch("http://localhost:8000/uploaded_files");
        const filesData = await filesRes.json();
        setUploadedFiles(filesData.files || []);
      } else {
        alert(data.message || "File upload failed.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImages((prev) =>
      prev.includes(image) ? prev.filter((img) => img !== image) : [...prev, image]
    );
  };

  const handleImageSubmit = async () => {
    if (selectedImages.length === 0) {
      alert("Please select at least one image.");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/move_images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedImages),
      });
      if (res.ok) {
        const processRes = await fetch("http://127.0.0.1:8000/process_selected_images", {
          method: "POST",
        });
        if (processRes.ok) {
          alert("Processing started successfully");
          setShowImageModal(false);
          if (typeof onFileSubmit === "function") {
            onFileSubmit(true);
          }
        }
      }
    } catch (error) {
      console.error("Processing Error:", error);
      alert("Failed to start processing.");
    }
  };

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
            MMRAG
          </Typography>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            sx={{ ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxShadow: 3,
            borderLeft: "none",
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Settings
          </Typography>
          <TextField
            label="API Key"
            value={api}
            onChange={(e) => setApi(e.target.value)}
            fullWidth
            sx={{ mb: 2, boxShadow: 1, borderRadius: 1 }}
          />
          <Button
            onClick={handleApiSubmit}
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{ mb: 2, boxShadow: 2 }}
          >
            {isSubmitting ? "Submitting..." : "Submit API Key"}
          </Button>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ mb: 2, boxShadow: 2 }}
          >
            Upload File
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.csv,.md,.txt,.ppt,.pptx"
              hidden
            />
          </Button>
          {isUploading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-green-600" />
            </Box>
          ) : (
            <Button
              onClick={handleFileUpload}
              variant="outlined"
              fullWidth
              disabled={!file}
              sx={{ mb: 2, boxShadow: 1 }}
            >
              Submit File
            </Button>
          )}
          {/* NEW: URL Input */}
          <TextField
            label="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            onClick={handleUrlSubmit}
            variant="contained"
            fullWidth
            disabled={isUploading}
            sx={{ mb: 2 }}
          >
            {isUploading ? "Processing..." : "Scrape Website"}
          </Button>
        </Box>
        <Divider />
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, ml: 2 }}>
          Uploaded Files
        </Typography>
        <List>
          {(uploadedFiles || []).map((file, index) => (
            <ShadowListItem key={index}>
              <ListItemText primary={file} />
            </ShadowListItem>
          ))}
        </List>
      </Drawer>
      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Select Images to Process
            </h2>
            <div className="space-y-3 mb-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow"
                >
                  <input
                    type="checkbox"
                    id={`img-${index}`}
                    checked={selectedImages.includes(image)}
                    onChange={() => handleImageSelect(image)}
                    className="h-5 w-5"
                  />
                  <img
                    src={`http://127.0.0.1:8000/static/${image}`}
                    alt={image}
                    className="h-16 w-16 object-cover rounded shadow"
                  />
                  <label htmlFor={`img-${index}`} className="text-gray-900 dark:text-white">
                    {image}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg shadow"
              >
                Cancel
              </button>
              <button
                onClick={handleImageSubmit}
                disabled={selectedImages.length === 0}
                className={`px-4 py-2 rounded-lg text-white shadow ${
                  selectedImages.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-6 hover:bg-blue-7"
                }`}
              >
                Process Selected Images
              </button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
