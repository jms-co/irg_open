// The Notices and Disclaimers for Ocean Worlds Autonomy Testbed for Exploration
// Research and Simulation can be found in README.md in the root directory of
// this repository.

#include "NearFarClipPlugin.h"
#include <gazebo/common/Events.hh>
#include <gazebo/gui/GuiIface.hh>
#include <gazebo/rendering/UserCamera.hh>


using namespace irg;
using namespace gazebo;


GZ_REGISTER_GUI_PLUGIN(NearFarClipPlugin)


NearFarClipPlugin::NearFarClipPlugin()
{
  // GUIPlugin is derived from QWidget, but we never want a widget to be displayed
  setGeometry(0, 0, 0, 0);
}

NearFarClipPlugin::~NearFarClipPlugin()
{
}

void NearFarClipPlugin::Load(sdf::ElementPtr _sdf)
{
  double near = 0.1;
  if (_sdf->HasElement("near")) {
    near = _sdf->Get<double>("near");
  }

  double far = 200000.0;
  if (_sdf->HasElement("far")) {
    far = _sdf->Get<double>("far");
  }

  rendering::UserCameraPtr camera = gazebo::gui::get_active_camera();
  camera->SetClipDist(near, far);
}

