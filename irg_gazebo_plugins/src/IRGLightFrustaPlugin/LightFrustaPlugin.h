/*******************************************************************************
 * Copyright (c) 2018 United States Government as represented by the 
 * Administrator of the National Aeronautics and Space Administration. 
 * All rights reserved.
 ******************************************************************************/
#ifndef LightFrustaPlugin_h
#define LightFrustaPlugin_h


#include <gazebo/common/Plugin.hh>


namespace irg {

class LightFrustaPlugin : public gazebo::SystemPlugin {
public:
  LightFrustaPlugin() {}

  ~LightFrustaPlugin();

  void Load(int _argc = 0, char **_argv = NULL) {}

  void Init();

  void disableLightFrusta();

private:
  gazebo::event::ConnectionPtr m_update;
};

}

#endif // LightFrustaPlugin_h
